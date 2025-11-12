"""
LLM Usage Tracking Utilities

Shared utilities for tracking, aggregating, and logging LLM token usage across the codebase.
"""

import contextvars
from collections.abc import Callable
from contextlib import asynccontextmanager
from dataclasses import dataclass
from typing import Any

from litellm import ModelResponse

from src.core.logging import get_logger

logger = get_logger(__name__)

# Context variable for automatic usage tracking
# Automatically propagates through async/await boundaries
_usage_tracker: contextvars.ContextVar[Callable[[dict[str, Any]], None] | None] = (
    contextvars.ContextVar("usage_tracker", default=None)
)


@dataclass
class LLMUsageRecord:
    """Record of LLM token usage for a single operation."""

    operation: str
    model_name: str
    provider_model: str | None
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


class UsageTracker:
    """
    Tracks LLM usage records and provides aggregation and logging utilities.

    Usage:
        tracker = UsageTracker()
        callback = tracker.create_tracker("my_operation")
        set_usage_tracker(callback)
        # ... make LLM calls ...
        summary, records = tracker.consume_summary()
        log_usage_summary(summary, records, context="my_context")
    """

    def __init__(self) -> None:
        """Initialize an empty usage tracker."""
        self.usage_records: list[LLMUsageRecord] = []

    def reset(self) -> None:
        """Clear all recorded usage statistics."""
        self.usage_records.clear()

    def create_tracker(self, operation: str) -> Callable[[dict[str, Any]], None]:
        """
        Create a usage tracking callback bound to a specific operation.

        Args:
            operation: Name of the operation being tracked (e.g., "detect_locale", "classify_document")

        Returns:
            Callback function that can be used with set_usage_tracker() or usage_tracking()
        """

        def callback(usage_data: dict[str, Any]) -> None:
            record = LLMUsageRecord(
                operation=operation,
                model_name=str(usage_data.get("model_name", "unknown")),
                provider_model=usage_data.get("provider_model"),
                prompt_tokens=usage_data.get("prompt_tokens", 0),
                completion_tokens=usage_data.get("completion_tokens", 0),
                total_tokens=usage_data.get("total_tokens", 0),
            )
            self.usage_records.append(record)
            logger.debug(
                "LLM usage recorded: operation=%s model=%s provider=%s prompt=%s output=%s total=%s",
                record.operation,
                record.model_name,
                record.provider_model,
                record.prompt_tokens,
                record.completion_tokens,
                record.total_tokens,
            )

        return callback

    def get_summary(self) -> dict[str, dict[str, Any]]:
        """
        Aggregate token usage by model without clearing records.

        Returns:
            Dictionary mapping model names to aggregated statistics:
            {
                "model_name": {
                    "prompt_tokens": int,
                    "completion_tokens": int,
                    "total_tokens": int,
                    "provider_models": list[str]
                }
            }
        """
        summary: dict[str, dict[str, Any]] = {}
        for record in self.usage_records:
            entry = summary.setdefault(
                record.model_name,
                {
                    "prompt_tokens": 0,
                    "completion_tokens": 0,
                    "total_tokens": 0,
                    "provider_models": set(),
                },
            )
            entry["prompt_tokens"] += record.prompt_tokens
            entry["completion_tokens"] += record.completion_tokens
            entry["total_tokens"] += record.total_tokens
            if record.provider_model:
                entry["provider_models"].add(record.provider_model)

        # Convert sets to sorted lists for JSON serialization
        for entry in summary.values():
            providers = entry.get("provider_models")
            if isinstance(providers, set):
                entry["provider_models"] = sorted(providers)

        return summary

    def consume_summary(self) -> tuple[dict[str, dict[str, Any]], list[LLMUsageRecord]]:
        """
        Return aggregated usage information and clear recorded statistics.

        Returns:
            Tuple of (summary_dict, records_list). After calling, usage_records is cleared.
        """
        summary = self.get_summary()
        records = self.usage_records.copy()
        self.reset()
        return summary, records


def format_usage_summary(summary: dict[str, dict[str, Any]], include_providers: bool = True) -> str:
    """
    Format usage summary as a human-readable string.

    Args:
        summary: Usage summary dictionary from UsageTracker.get_summary()
        include_providers: Whether to include provider model information

    Returns:
        Formatted string like: "model1: prompt=100 output=50 total=150; model2: prompt=200 output=100 total=300"
    """
    summary_parts: list[str] = []
    for model, stats in summary.items():
        provider_str = ""
        if include_providers:
            providers = stats.get("provider_models") or []
            if providers:
                provider_str = f" [{', '.join(providers)}]"

        summary_parts.append(
            f"{model}{provider_str}: prompt={stats['prompt_tokens']} "
            f"output={stats['completion_tokens']} total={stats['total_tokens']}"
        )

    return "; ".join(summary_parts)


def log_usage_summary(
    summary: dict[str, dict[str, Any]],
    records: list[LLMUsageRecord],
    context: str | None = None,
    reason: str | None = None,
    log_level: str = "info",
) -> None:
    """
    Log LLM usage summary and detailed records.

    Args:
        summary: Usage summary dictionary from UsageTracker.get_summary()
        records: List of usage records
        context: Context identifier (e.g., URL, request ID, operation name)
        reason: Optional reason suffix for the log message
        log_level: Logging level ("info", "debug", "warning")
    """
    if not summary:
        if context:
            logger.debug(f"No LLM usage recorded for {context}")
        return

    reason_suffix = f" ({reason})" if reason else ""
    context_str = f" for {context}" if context else ""
    formatted_summary = format_usage_summary(summary)

    # Log summary at specified level
    log_func = getattr(logger, log_level, logger.info)
    log_func(f"🔢 LLM token usage{context_str}{reason_suffix}: {formatted_summary}")

    # Log detailed records at debug level
    for record in records:
        logger.debug(
            "LLM usage detail: context=%s operation=%s model=%s provider=%s prompt=%s output=%s total=%s",
            context or "unknown",
            record.operation,
            record.model_name,
            record.provider_model,
            record.prompt_tokens,
            record.completion_tokens,
            record.total_tokens,
        )


def aggregate_usage_records(records: list[LLMUsageRecord]) -> dict[str, dict[str, Any]]:
    """
    Aggregate a list of usage records into a summary dictionary.

    Useful when you have records from multiple sources or want to aggregate
    without using UsageTracker.

    Args:
        records: List of LLMUsageRecord instances

    Returns:
        Aggregated summary dictionary (same format as UsageTracker.get_summary())
    """
    summary: dict[str, dict[str, Any]] = {}
    for record in records:
        entry = summary.setdefault(
            record.model_name,
            {
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0,
                "provider_models": set(),
            },
        )
        entry["prompt_tokens"] += record.prompt_tokens
        entry["completion_tokens"] += record.completion_tokens
        entry["total_tokens"] += record.total_tokens
        if record.provider_model:
            entry["provider_models"].add(record.provider_model)

    # Convert sets to sorted lists
    for entry in summary.values():
        providers = entry.get("provider_models")
        if isinstance(providers, set):
            entry["provider_models"] = sorted(providers)

    return summary


def _get_usage_value(usage_obj: Any, keys: list[str]) -> int:
    """
    Safely extract an integer token count from a usage object or dictionary.
    """
    for key in keys:
        value: Any | None = None
        if isinstance(usage_obj, dict):
            value = usage_obj.get(key)
        else:
            value = getattr(usage_obj, key, None)

        if value is None:
            continue

        if isinstance(value, int | float):
            return int(value)

        try:
            return int(float(value))
        except (TypeError, ValueError):
            continue

    return 0


def set_usage_tracker(callback: Callable[[dict[str, Any]], None] | None) -> None:
    """
    Set the usage tracker callback for the current async context.

    This callback will be automatically invoked for all LLM completions
    within this context. Works seamlessly with async/await boundaries.

    Args:
        callback: Function that receives usage data dict with keys:
                 model_name, provider_model, prompt_tokens, completion_tokens, total_tokens
    """
    _usage_tracker.set(callback)


def get_usage_tracker() -> Callable[[dict[str, Any]], None] | None:
    """
    Get the usage tracker callback from the current async context.

    Returns:
        The callback function if set, None otherwise
    """
    return _usage_tracker.get()


@asynccontextmanager
async def usage_tracking(callback: Callable[[dict[str, Any]], None]) -> Any:
    """
    Async context manager for automatic usage tracking.

    Sets up usage tracking for all LLM calls within the context.
    Automatically restores previous tracker when exiting.

    Example:
        async with usage_tracking(my_callback):
            response = await acompletion_with_fallback(messages=[...])
            # Usage automatically tracked
    """
    previous = get_usage_tracker()
    set_usage_tracker(callback)
    try:
        yield
    finally:
        set_usage_tracker(previous)


def track_usage(
    response: ModelResponse,
    model_name: str,
    provider_model: str,
) -> None:
    """
    Extract usage data from response and invoke tracker from context if available.

    Args:
        response: ModelResponse from litellm
        model_name: The model name that was used
        provider_model: The actual provider model identifier
    """
    callback = get_usage_tracker()
    if not callback:
        return

    try:
        usage = getattr(response, "usage", None)
        prompt_tokens = (
            _get_usage_value(usage, ["prompt_tokens", "input_tokens", "tokens_input"])
            if usage
            else 0
        )
        completion_tokens = (
            _get_usage_value(usage, ["completion_tokens", "output_tokens", "tokens_output"])
            if usage
            else 0
        )
        total_tokens = (
            _get_usage_value(usage, ["total_tokens"])
            if usage
            else prompt_tokens + completion_tokens
        )
        if total_tokens == 0:
            total_tokens = prompt_tokens + completion_tokens

        callback(
            {
                "model_name": model_name,
                "provider_model": provider_model,
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": total_tokens,
            }
        )
    except Exception as callback_error:  # pragma: no cover - defensive
        logger.exception("Usage callback failed for model %s: %s", model_name, callback_error)
