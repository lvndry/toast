"""RAG service for managing RAG operations."""

from __future__ import annotations

from src.core.logging import get_logger
from src.rag import get_answer
from src.services.base_service import BaseService

logger = get_logger(__name__)


class RAGService(BaseService):
    """Service for RAG-related operations."""

    _instance: RAGService | None = None

    def __new__(cls) -> RAGService:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def get_answer(
        self, question: str, company_name: str, namespace: str | None = None
    ) -> str:
        """Get an answer using RAG."""
        try:
            answer = await get_answer(question, company_name, namespace=namespace)
            logger.info(f"Generated RAG answer for company {company_name}")
            return str(answer)
        except Exception as e:
            logger.error(f"Error getting RAG answer for company {company_name}: {e}")
            raise e

    async def get_company_context(self, company_name: str) -> dict:
        """Get context information for a company."""
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


# Global instance
rag_service = RAGService()
