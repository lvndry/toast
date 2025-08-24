import asyncio
from collections.abc import Iterable

from src.embedding import embed_company_documents


class EmbeddingService:
    """Service for handling document embedding operations without UI dependencies.

    This module exposes async methods only. Any threading, warning suppression,
    or UI-specific concerns must be handled in the caller (e.g., dashboard layer).
    """

    async def embed_single_company(self, company_slug: str) -> bool:
        """Embed documents for a single company.

        Args:
            company_slug: The slug of the company to embed

        Returns:
            True if successful, False if failed
        """
        try:
            await embed_company_documents(company_slug)
            return True
        except Exception as e:
            print(f"Error embedding {company_slug}: {str(e)}")
            return False

    async def embed_multiple_companies(
        self, company_slugs: Iterable[str], max_concurrency: int = 3
    ) -> list[tuple[str, bool]]:
        """Embed documents for multiple companies concurrently using asyncio.

        Args:
            company_slugs: Iterable of company slugs to embed
            max_concurrency: Maximum number of concurrent embedding tasks

        Returns:
            List of tuples (company_slug, success_status)
        """
        semaphore = asyncio.Semaphore(max_concurrency)

        async def _bounded_embed(slug: str) -> tuple[str, bool]:
            async with semaphore:
                success = await self.embed_single_company(slug)
                return slug, success

        tasks = [_bounded_embed(slug) for slug in company_slugs]
        results = await asyncio.gather(*tasks, return_exceptions=False)
        return list(results)


# Create a singleton instance
embedding_service = EmbeddingService()
