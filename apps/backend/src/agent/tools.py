from typing import Any

from src.core.logging import get_logger
from src.llm import acompletion_with_fallback, get_embeddings
from src.pinecone_client import INDEX_NAME, pc
from src.prompts.compliance_prompts import COMPLIANCE_CHECK_PROMPT

logger = get_logger(__name__)


async def embed_query(query: str) -> list[float]:
    """
    Convert a text query into vector embeddings.

    Args:
        query: The text query to embed

    Returns:
        list[float]: The vector embedding of the query
    """
    try:
        response = await get_embeddings(
            input=query,
            input_type="query",
        )

        return response.data[0]["embedding"]  # type: ignore
    except Exception as e:
        logger.error(f"Error getting embeddings: {str(e)}")
        raise


async def search_query(
    query: str, company_slug: str, top_k: int = 8, *, namespace: str | None = None
) -> dict[str, Any]:
    """
    Search for relevant documents in Pinecone.

    Args:
        query: The search query
        company_slug: The company slug (used as namespace if namespace not provided)
        top_k: Number of results to return
        namespace: Optional specific namespace

    Returns:
        dict: Pinecone search results
    """
    # Convert text query to vector embedding
    query_vector = await embed_query(query)
    index = pc.Index(INDEX_NAME)
    ns = namespace or company_slug
    search_results = index.query(
        namespace=ns,
        top_k=top_k,
        vector=query_vector,
        include_metadata=True,
        include_values=False,
    )

    return search_results  # type: ignore


async def check_compliance(regulation: str, company_slug: str) -> str:
    """
    Check if the company's documents comply with a specific regulation.

    Args:
        regulation: The regulation to check (e.g., "GDPR", "CCPA")
        company_slug: The company slug to search within

    Returns:
        str: Assessment of compliance
    """
    # 1. Search for relevant documents (broad search for regulation keywords)
    search_query_text = f"privacy policy terms {regulation} compliance data rights"
    search_results = await search_query(search_query_text, company_slug, top_k=10)

    if not search_results.get("matches"):
        return f"I couldn't find enough information to assess {regulation} compliance."

    # 2. Prepare context
    chunks = []
    for match in search_results["matches"]:
        chunks.append(match["metadata"].get("chunk_text", ""))
    context = "\n\n---\n\n".join(chunks)

    # 3. Ask LLM to assess
    messages = [
        {"role": "system", "content": "You are a legal compliance expert."},
        {
            "role": "user",
            "content": COMPLIANCE_CHECK_PROMPT.format(regulation=regulation, context=context),
        },
    ]

    try:
        response = await acompletion_with_fallback(messages=messages)
        return str(response.choices[0].message.content)
    except Exception as e:
        logger.error(f"Error checking compliance: {e}")
        return f"Error checking compliance: {str(e)}"
