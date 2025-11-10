"""Prompt templates for LLM interactions across Toast AI."""

from src.prompts.rag_prompts import RAG_SYSTEM_PROMPT
from src.prompts.summarizer_prompts import (
    DOCUMENT_SUMMARY_SYSTEM_PROMPT,
    META_SUMMARY_SYSTEM_PROMPT,
)

__all__ = [
    "RAG_SYSTEM_PROMPT",
    "DOCUMENT_SUMMARY_SYSTEM_PROMPT",
    "META_SUMMARY_SYSTEM_PROMPT",
]
