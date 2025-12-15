"""RAG service for managing RAG operations.

This service is stateless and doesn't need database access or repository.
It's a pure wrapper around the RAG module.
"""

from __future__ import annotations

from typing import Any

from src.core.logging import get_logger
from src.rag import get_answer

logger = get_logger(__name__)


class RAGService:
    """Service for RAG-related operations.

    This is a stateless service that doesn't need database access.
    """

    async def get_answer(
        self, question: str, company_name: str, namespace: str | None = None
    ) -> str:
        """Get an answer using RAG.

        Args:
            question: User's question
            company_name: Company name for context
            namespace: Optional namespace for vector search

        Returns:
            AI-generated answer
        """
        try:
            answer = await get_answer(question, company_name, namespace=namespace)
            logger.info(f"Generated RAG answer for company {company_name}")
            return str(answer)
        except Exception as e:
            logger.error(f"Error getting RAG answer for company {company_name}: {e}")
            raise e

    def get_company_context(self, company_name: str) -> dict[str, Any]:
        """Get context information for a company.

        Args:
            company_name: Company name

        Returns:
            Context dictionary
        """
        try:
            # This could be expanded to include more context gathering
            context = {
                "company_name": company_name,
                "namespace": company_name.lower().replace(" ", "_"),
            }
            return context
        except Exception as e:
            logger.error(f"Error getting context for company {company_name}: {e}")
            raise e
