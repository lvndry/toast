import os
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
    Execute LLM completion with fallback to alternative models on failure.

    Tries models in priority order until one succeeds. Each call is independent
    and does not maintain state across calls (thread-safe for concurrent use).

    Args:
        messages: List of message dicts for the LLM
        model_priority: Optional list of models to try in order. If None, uses DEFAULT_MODEL_PRIORITY.
        **kwargs: Additional arguments to pass to acompletion (temperature, response_format, etc.)

    Returns:
        ModelResponse from the first model that succeeds

    Raises:
        Exception: If all models fail, raises the last exception encountered
    """
    # Use provided priority or default
    models_to_try = model_priority.copy() if model_priority else DEFAULT_MODEL_PRIORITY.copy()
    last_exception: Exception | None = None

    # Try each model in order until one succeeds
    for model_name in models_to_try:
        model = get_model(model_name)
        logger.debug(f"Attempting completion with model: {model_name} ({model.model})")

        try:
            response = await acompletion(
                model=model.model,
                api_key=model.api_key,
                messages=messages,
                **kwargs,
            )

            # Success - return immediately
            logger.debug(f"Successfully completed with model: {model_name}")
            return response

        except Exception as e:
            last_exception = e
            logger.warning(f"Model {model_name} failed: {e}. Trying next model...")
            # Continue to next model
            continue

    # All models failed
    error_msg = (
        f"All {len(models_to_try)} models failed. "
        f"Tried: {', '.join(models_to_try)}. "
        f"Last error: {last_exception}"
    )
    logger.error(error_msg)
    raise Exception(error_msg) from last_exception


def completion_with_fallback(
    messages: list[dict[str, str]],
    model_priority: list[SupportedModel] | None = None,
    **kwargs: Any,
) -> ModelResponse:
    """
    Synchronous version of acompletion_with_fallback for non-async contexts.

    Execute LLM completion with fallback to alternative models on failure.

    Tries models in priority order until one succeeds. Each call is independent
    and does not maintain state across calls (thread-safe for concurrent use).

    Args:
        messages: List of message dicts for the LLM
        model_priority: Optional list of models to try in order. If None, uses DEFAULT_MODEL_PRIORITY.
        **kwargs: Additional arguments to pass to completion (temperature, response_format, etc.)

    Returns:
        ModelResponse from the first model that succeeds

    Raises:
        Exception: If all models fail, raises the last exception encountered
    """
    # Use provided priority or default
    models_to_try = model_priority.copy() if model_priority else DEFAULT_MODEL_PRIORITY.copy()
    last_exception: Exception | None = None

    # Try each model in order until one succeeds
    for model_name in models_to_try:
        model = get_model(model_name)
        logger.debug(f"Attempting completion with model: {model_name} ({model.model})")

        try:
            response = completion(
                model=model.model,
                api_key=model.api_key,
                messages=messages,
                **kwargs,
            )

            # Success - return immediately
            logger.debug(f"Successfully completed with model: {model_name}")
            return response

        except Exception as e:
            last_exception = e
            logger.warning(f"Model {model_name} failed: {e}. Trying next model...")
            # Continue to next model
            continue

    # All models failed
    error_msg = (
        f"All {len(models_to_try)} models failed. "
        f"Tried: {', '.join(models_to_try)}. "
        f"Last error: {last_exception}"
    )
    logger.error(error_msg)
    raise Exception(error_msg) from last_exception


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
