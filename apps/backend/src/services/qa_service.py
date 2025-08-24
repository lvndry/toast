from src.rag import get_answer


async def ask(query: str, company_slug: str, namespace: str | None = None) -> str:
    return await get_answer(query, company_slug, namespace=namespace)
