from __future__ import annotations

import asyncio
from collections.abc import Iterable

from motor.core import AgnosticDatabase

from src.core.logging import get_logger
from src.embedding import embed_product_documents
from src.services.service_factory import create_document_service, create_product_service

logger = get_logger(__name__)


class EmbeddingService:
    """Service for handling document embedding operations without UI dependencies.

    This module exposes async methods only. Any threading, warning suppression,
    or UI-specific concerns must be handled in the caller (e.g., dashboard layer).
    """

    async def embed_single_product(self, db: AgnosticDatabase, product_slug: str) -> bool:
        """Embed documents for a single product.

        Args:
            db: Database instance
            product_slug: The slug of the product to embed

        Returns:
            True if successful, False if failed
        """
        try:
            product_service = create_product_service()
            document_service = create_document_service()

            product = await product_service.get_product_by_slug(db, product_slug)
            if not product:
                logger.error(f"Product {product_slug} not found for embedding")
                return False

            await embed_product_documents(product.id, document_service, db, namespace=product_slug)
            return True
        except Exception as e:
            logger.error(f"Error embedding {product_slug}: {str(e)}", exc_info=True)
            return False

    async def embed_multiple_products(
        self, db: AgnosticDatabase, product_slugs: Iterable[str], max_concurrency: int = 3
    ) -> list[tuple[str, bool]]:
        """Embed documents for multiple products concurrently using asyncio.

        Args:
            db: Database instance
            product_slugs: Iterable of product slugs to embed
            max_concurrency: Maximum number of concurrent embedding tasks

        Returns:
            List of tuples (product_slug, success_status)
        """
        semaphore = asyncio.Semaphore(max_concurrency)

        async def _bounded_embed(slug: str) -> tuple[str, bool]:
            async with semaphore:
                success = await self.embed_single_product(db, slug)
                return slug, success

        tasks = [_bounded_embed(slug) for slug in product_slugs]
        results = await asyncio.gather(*tasks, return_exceptions=False)
        return list(results)
