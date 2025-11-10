import asyncio
from typing import Any

from dotenv import load_dotenv

from src.core.logging import get_logger
from src.llm import completion_with_fallback, get_embeddings
from src.pinecone import INDEX_NAME, pc
from src.prompts.rag_prompts import RAG_SYSTEM_PROMPT

load_dotenv()
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


async def get_answer(question: str, company_slug: str, *, namespace: str | None = None) -> str:
    """
    Get an answer to a question using RAG with LiteLLM and Pinecone.

    Args:
        question: The question to answer
        company_slug: The company slug to search within

    Returns:
        str: The answer to the question
    """
    # Search for relevant documents in Pinecone
    # Fetch top 25 results to give the LLM more context
    # We get 25 chunks × ~500 tokens/chunk (2000 chars ≈ 500 tokens) = ~12,500 tokens of context
    search_results = await search_query(question, company_slug, namespace=namespace, top_k=25)
    logger.debug(f"Search results: {search_results}")

    if len(search_results["matches"]) == 0:
        return "I couldn't find any relevant information to answer your question."

    # Extract the relevant chunks from the search results with metadata
    formatted_chunks = []
    citations = []
    for match in search_results["matches"]:
        chunk = f"""Document type: {match["metadata"]["document_type"]}
Document URL: {match["metadata"]["url"]}
{match["metadata"]["chunk_text"]}"""
        formatted_chunks.append(chunk)
        citations.append(
            {
                "url": match["metadata"].get("url"),
                "title": match["metadata"].get("title"),
                "document_type": match["metadata"].get("document_type"),
                "chunk_index": match["metadata"].get("chunk_index"),
                "start": match["metadata"].get("chunk_start"),
                "end": match["metadata"].get("chunk_end"),
            }
        )

    context = "\n\n---\n\n".join(formatted_chunks)
    logger.info(f"Context: {context}")

    # Create the messages for the chat
    messages = [
        {"role": "system", "content": RAG_SYSTEM_PROMPT},
        {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"},
    ]

    try:
        response = completion_with_fallback(
            messages=messages,
            temperature=0.3,
        )
        answer_text = response.choices[0].message.content
        # Append lightweight citation block for UI until structured response is added end-to-end
        try:
            if citations:
                citation_lines = []
                for c in citations[:5]:
                    citation_lines.append(
                        f"- {c.get('document_type')}: {c.get('title') or ''} ({c.get('url')})"
                    )
                answer_text += "\n\nSources:\n" + "\n".join(citation_lines)
        except Exception:
            pass
        return str(answer_text)
    except Exception as e:
        logger.error(f"Error getting completion from LiteLLM: {str(e)}")
        return "I apologize, but I encountered an error while trying to generate an answer."


if __name__ == "__main__":
    answer = asyncio.run(get_answer("what personal information notion stores about me?", "notion"))
    logger.info(answer)
