from __future__ import annotations

import asyncio
from collections.abc import Iterable

from motor.core import AgnosticDatabase

from src.core.logging import get_logger
from src.embedding import embed_company_documents
from src.services.service_factory import create_company_service, create_document_service

logger = get_logger(__name__)


class EmbeddingService:
    """Service for handling document embedding operations without UI dependencies.

    This module exposes async methods only. Any threading, warning suppression,
    or UI-specific concerns must be handled in the caller (e.g., dashboard layer).
    """

    async def embed_single_company(self, db: AgnosticDatabase, company_slug: str) -> bool:
        """Embed documents for a single company.

        Args:
            db: Database instance
            company_slug: The slug of the company to embed

        Returns:
            True if successful, False if failed
        """
        try:
            company_service = create_company_service()
            document_service = create_document_service()

            company = await company_service.get_company_by_slug(db, company_slug)
            if not company:
                logger.error(f"Company {company_slug} not found for embedding")
                return False

            await embed_company_documents(company.id, document_service, db, namespace=company_slug)
            return True
        except Exception as e:
            logger.error(f"Error embedding {company_slug}: {str(e)}", exc_info=True)
            return False

    async def embed_multiple_companies(
        self, db: AgnosticDatabase, company_slugs: Iterable[str], max_concurrency: int = 3
    ) -> list[tuple[str, bool]]:
        """Embed documents for multiple companies concurrently using asyncio.

        Args:
            db: Database instance
            company_slugs: Iterable of company slugs to embed
            max_concurrency: Maximum number of concurrent embedding tasks

        Returns:
            List of tuples (company_slug, success_status)
        """
        semaphore = asyncio.Semaphore(max_concurrency)

        async def _bounded_embed(slug: str) -> tuple[str, bool]:
            async with semaphore:
                success = await self.embed_single_company(db, slug)
                return slug, success

        tasks = [_bounded_embed(slug) for slug in company_slugs]
        results = await asyncio.gather(*tasks, return_exceptions=False)
        return list(results)
