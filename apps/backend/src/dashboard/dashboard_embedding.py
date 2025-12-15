from src.core.database import get_db
from src.dashboard.utils import run_async
from src.services.embedding_service import EmbeddingService


async def _embed_company_impl(company_slug: str) -> bool:
    async with get_db() as db:
        service = EmbeddingService()
        embedding_success = await service.embed_single_company(db, company_slug)
        return bool(embedding_success)


async def _embed_companies_impl(
    company_slugs: list[str], max_concurrency: int = 3
) -> list[tuple[str, bool]]:
    async with get_db() as db:
        service = EmbeddingService()
        embedding_successes = await service.embed_multiple_companies(
            db, company_slugs, max_concurrency=max_concurrency
        )
        return [(slug, bool(success)) for slug, success in embedding_successes]


def embed_company(company_slug: str) -> bool:
    """Embed a single company via the async service, executed safely from Streamlit.

    Returns True on success, False on failure.
    """
    result = run_async(_embed_company_impl(company_slug))
    return bool(result)


def embed_companies(company_slugs: list[str], max_concurrency: int = 3) -> list[tuple[str, bool]]:
    """Embed multiple companies via the async service, executed safely from Streamlit.

    Returns list of (slug, success) tuples. Returns empty list on failure.
    """
    result = run_async(_embed_companies_impl(company_slugs, max_concurrency=max_concurrency))
    return result or []
