from src.dashboard.utils import run_async
from src.services.embedding_service import embedding_service


def embed_company(company_slug: str) -> bool:
    """Embed a single company via the async service, executed safely from Streamlit.

    Returns True on success, False on failure.
    """
    result = run_async(embedding_service.embed_single_company(company_slug))
    return bool(result)


def embed_companies(company_slugs: list[str], max_concurrency: int = 3) -> list[tuple[str, bool]]:
    """Embed multiple companies via the async service, executed safely from Streamlit.

    Returns list of (slug, success) tuples. Returns empty list on failure.
    """
    result = run_async(
        embedding_service.embed_multiple_companies(company_slugs, max_concurrency=max_concurrency)
    )
    return result or []
