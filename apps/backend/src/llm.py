import os
import time
from typing import Any, Literal

from litellm import EmbeddingResponse, ModelResponse, acompletion, completion, embedding

from src.core.logging import get_logger

logger = get_logger(__name__)


class Model:
    model: str
    api_key: str

    def __init__(self, model: str, api_key: str):
        self.model = model
        self.api_key = api_key


SupportedModel = Literal[
    "mistral-small",
    "mistral-medium",
    "gemini-2.0-flash",
    "gemini-2.5-flash-lite",
    "voyage-law-2",
    "openrouter-qwen-3-4b-free",
    "huggingface-minimax-m2",
]

# Default model priority list for fallback
DEFAULT_MODEL_PRIORITY: list[SupportedModel] = [
    "gemini-2.5-flash-lite",
    "mistral-small",
    "openrouter-qwen-3-4b-free",
    "huggingface-minimax-m2",
]


class ModelFallbackManager:
    """
    Manages stateful model fallback across multiple calls.

    Maintains a "current model" that is used for all calls until it fails.
    When a model fails, it switches to the next model in priority order.
    Failed models can recover after a cooldown period (1 minute by default).
    Stops when all models have been tried at least once and all failed.
    """

    def __init__(
        self, model_priority: list[SupportedModel] | None = None, cooldown_seconds: int = 60
    ):
        self.model_priority = model_priority or DEFAULT_MODEL_PRIORITY.copy()
        self.current_model_index = 0
        self.failed_models: dict[int, float] = {}  # Track when models failed (timestamp)
        self.cooldown_seconds = cooldown_seconds  # 1 minute default

    def _is_model_failed(self, model_index: int) -> bool:
        """Check if a model is currently failed (within cooldown period)."""
        if model_index not in self.failed_models:
            return False
        failure_time = self.failed_models[model_index]
        elapsed = time.time() - failure_time
        if elapsed >= self.cooldown_seconds:
            # Model has recovered, remove from failed list
            del self.failed_models[model_index]
            model_name = self.model_priority[model_index]
            logger.info(f"Model {model_name} has recovered after {elapsed:.1f}s cooldown")
            return False
        return True

    def get_current_model(self) -> SupportedModel:
        """
        Get the current model to use, checking for recovered models.

        If the current model is failed, automatically switches to an available model.
        """
        # Check if current model has recovered or is still failed
        if self._is_model_failed(self.current_model_index):
            # Current model is still failed, find an available one
            if not self._switch_to_available_model():
                # No available models - this will be handled by mark_current_model_failed
                # but we still need to return something, so return current (failed) model
                pass
        return self.model_priority[self.current_model_index]

    def _switch_to_available_model(self) -> bool:
        """Switch to an available (non-failed) model. Returns True if found, False otherwise."""
        self._cleanup_recovered_models()

        # Find any available model
        for i in range(len(self.model_priority)):
            candidate_index = (self.current_model_index + i + 1) % len(self.model_priority)
            if not self._is_model_failed(candidate_index):
                if candidate_index != self.current_model_index:
                    self.current_model_index = candidate_index
                    logger.info(
                        f"Switched to available model: {self.model_priority[self.current_model_index]}"
                    )
                return True
        return False

    def mark_current_model_failed(self, exception: Exception) -> bool:
        """
        Mark the current model as failed and switch to the next available model.

        Returns:
            True if there are more models to try, False if all models have been exhausted.
        """
        model_name = self.get_current_model()
        self.failed_models[self.current_model_index] = time.time()
        logger.warning(
            f"Model {model_name} failed: {exception}. Switching to next model in priority list."
        )

        # Clean up recovered models before checking
        self._cleanup_recovered_models()

        # Check if all models are currently failed
        active_models = [i for i in range(len(self.model_priority)) if not self._is_model_failed(i)]
        if not active_models:
            logger.error(
                f"All models are currently failed. Will retry after {self.cooldown_seconds}s cooldown."
            )
            return False

        # Find the next model that isn't failed
        start_index = (self.current_model_index + 1) % len(self.model_priority)
        for i in range(len(self.model_priority)):
            candidate_index = (start_index + i) % len(self.model_priority)
            if not self._is_model_failed(candidate_index):
                self.current_model_index = candidate_index
                new_model = self.get_current_model()
                logger.info(f"Switched to model: {new_model}")
                return True

        # Should not reach here, but handle edge case
        logger.error("No available models found (should not happen)")
        return False

    def _cleanup_recovered_models(self) -> None:
        """Remove models that have recovered from the failed list."""
        current_time = time.time()
        recovered = [
            idx
            for idx, failure_time in self.failed_models.items()
            if current_time - failure_time >= self.cooldown_seconds
        ]
        for idx in recovered:
            del self.failed_models[idx]
            if recovered:
                logger.debug(
                    f"Cleaned up {len(recovered)} recovered model(s): "
                    f"{[self.model_priority[i] for i in recovered]}"
                )

    def reset(self, model_priority: list[SupportedModel] | None = None) -> None:
        """Reset the fallback manager to start from the beginning."""
        if model_priority is not None:
            self.model_priority = model_priority.copy()
        self.current_model_index = 0
        self.failed_models.clear()


# Global fallback manager instance
_fallback_manager = ModelFallbackManager()


def get_model(model_name: SupportedModel) -> Model:
    if "mistral" in model_name:
        MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
        if not MISTRAL_API_KEY:
            raise ValueError("MISTRAL_API_KEY is not set")

        model_mapping = {
            "mistral-small": "mistral/mistral-small-latest",
            "mistral-medium": "mistral/mistral-medium-latest",
        }

        full_model = model_mapping.get(model_name, f"mistral/{model_name}")
        return Model(
            model=full_model,
            api_key=MISTRAL_API_KEY,
        )
    elif "gemini" in model_name:
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set")

        model_mapping = {
            "gemini-2.0-flash": "gemini/gemini-2.0-flash",
            "gemini-2.5-flash-lite": "gemini/gemini-2.5-flash-lite",
        }

        full_model = model_mapping.get(model_name, f"gemini/{model_name}")
        return Model(
            model=full_model,
            api_key=GEMINI_API_KEY,
        )
    elif model_name == "voyage-law-2":
        VOYAGE_API_KEY = os.getenv("VOYAGE_API_KEY")
        if not VOYAGE_API_KEY:
            raise ValueError("VOYAGE_API_KEY is not set")

        return Model(
            model="voyage/voyage-law-2",
            api_key=VOYAGE_API_KEY,
        )
    elif model_name == "openrouter-qwen-3-4b-free":
        OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
        if not OPENROUTER_API_KEY:
            raise ValueError("OPENROUTER_API_KEY is not set")

        return Model(
            model="openrouter/qwen/qwen3-4b:free",
            api_key=OPENROUTER_API_KEY,
        )
    elif model_name == "huggingface-minimax-m2":
        HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
        if not HUGGINGFACE_API_KEY:
            raise ValueError("HUGGINGFACE_API_KEY is not set")

        return Model(
            model="huggingface/MiniMaxAI/MiniMax-M2",
            api_key=HUGGINGFACE_API_KEY,
        )
    else:
        raise ValueError(f"Unsupported model: {model_name}")


async def acompletion_with_fallback(
    messages: list[dict[str, str]],
    model_priority: list[SupportedModel] | None = None,
    **kwargs: Any,
) -> ModelResponse:
    """
    Execute LLM completion with stateful fallback to alternative models on failure.

    This function uses a "current model" that persists across calls. All calls use
    the current model until it fails. When a model fails, it switches to the next
    model in priority order and uses that for all subsequent calls. Failed models
    can recover after a 1-minute cooldown period and will be automatically retried.

    Args:
        messages: List of message dicts for the LLM
        model_priority: Optional list of models to try in order. If None, uses DEFAULT_MODEL_PRIORITY.
                       If provided, resets the fallback manager with the new priority.
        **kwargs: Additional arguments to pass to acompletion (temperature, response_format, etc.)

    Returns:
        ModelResponse from the current model

    Raises:
        Exception: If all models are currently failed (they may recover after cooldown)
    """
    global _fallback_manager

    # Reset manager if custom priority is provided
    if model_priority is not None:
        _fallback_manager.reset(model_priority)

    last_exception: Exception | None = None

    # Keep trying until we exhaust all models
    while True:
        model_name = _fallback_manager.get_current_model()
        model = get_model(model_name)
        logger.debug(f"Attempting completion with current model: {model_name} ({model.model})")

        try:
            response = await acompletion(
                model=model.model,
                api_key=model.api_key,
                messages=messages,
                **kwargs,
            )

            # Success - return immediately, keep using this model for future calls
            return response

        except Exception as e:
            last_exception = e
            # Mark current model as failed and switch to next
            has_more_models = _fallback_manager.mark_current_model_failed(e)

            if not has_more_models:
                # All models are currently failed (may recover after cooldown)
                error_msg = (
                    f"All {len(_fallback_manager.model_priority)} models are currently failed. "
                    f"Models will recover after {_fallback_manager.cooldown_seconds}s cooldown. "
                    f"Last error: {last_exception}"
                )
                logger.error(error_msg)
                raise Exception(error_msg) from last_exception

            # Continue loop to try next model
            continue


def completion_with_fallback(
    messages: list[dict[str, str]],
    model_priority: list[SupportedModel] | None = None,
    **kwargs: Any,
) -> ModelResponse:
    """
    Synchronous version of acompletion_with_fallback for non-async contexts.

    Execute LLM completion with stateful fallback to alternative models on failure.

    This function uses a "current model" that persists across calls. All calls use
    the current model until it fails. When a model fails, it switches to the next
    model in priority order and uses that for all subsequent calls. This continues
    until all models have been tried at least once and all failed.

    Args:
        messages: List of message dicts for the LLM
        model_priority: Optional list of models to try in order. If None, uses DEFAULT_MODEL_PRIORITY.
                       If provided, resets the fallback manager with the new priority.
        **kwargs: Additional arguments to pass to completion (temperature, response_format, etc.)

    Returns:
        ModelResponse from the current model

    Raises:
        Exception: If all models have been tried at least once and all failed
    """
    global _fallback_manager

    # Reset manager if custom priority is provided
    if model_priority is not None:
        _fallback_manager.reset(model_priority)

    last_exception: Exception | None = None

    # Keep trying until we exhaust all models
    while True:
        model_name = _fallback_manager.get_current_model()
        model = get_model(model_name)
        logger.debug(f"Attempting completion with current model: {model_name} ({model.model})")

        try:
            response = completion(
                model=model.model,
                api_key=model.api_key,
                messages=messages,
                **kwargs,
            )

            # Success - return immediately, keep using this model for future calls
            return response

        except Exception as e:
            last_exception = e
            # Mark current model as failed and switch to next
            has_more_models = _fallback_manager.mark_current_model_failed(e)

            if not has_more_models:
                # All models are currently failed (may recover after cooldown)
                error_msg = (
                    f"All {len(_fallback_manager.model_priority)} models are currently failed. "
                    f"Models will recover after {_fallback_manager.cooldown_seconds}s cooldown. "
                    f"Last error: {last_exception}"
                )
                logger.error(error_msg)
                raise Exception(error_msg) from last_exception

            # Continue loop to try next model
            continue


async def get_embeddings(
    input: str | list[str],
    input_type: Literal["query", "document"] | None = None,
    model_name: SupportedModel = "voyage-law-2",
) -> EmbeddingResponse:
    """
    Generate embeddings for text input using the specified model.

    Args:
        input: Single text string or list of text strings to embed
        input_type: Optional type of input - "query" for search queries, "document" for documents.
                   Some models (like voyage-law-2) use this to optimize embeddings.
        model_name: The model to use for embeddings (default: "voyage-law-2")

    Returns:
        EmbeddingResponse containing the embeddings and metadata

    Raises:
        Exception: If embedding generation fails
    """
    model = get_model(model_name)
    try:
        kwargs: dict[str, Any] = {
            "model": model.model,
            "api_key": model.api_key,
            "input": input if isinstance(input, list) else [input],
        }

        if input_type:
            kwargs["input_type"] = input_type

        response: EmbeddingResponse = await embedding(**kwargs)
        return response
    except Exception as e:
        logger.error(f"Error getting embeddings with {model_name}: {str(e)}")
        raise
