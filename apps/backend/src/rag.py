import asyncio
import os

from dotenv import load_dotenv
from litellm import completion, embedding
from loguru import logger

from src.models import get_model
from src.pinecone import INDEX_NAME, pc

load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
if not MISTRAL_API_KEY:
    raise ValueError("MISTRAL_API_KEY is not set")

VOYAGE_API_KEY = os.getenv("VOYAGE_API_KEY")
if not VOYAGE_API_KEY:
    raise ValueError("VOYAGE_API_KEY is not set")


async def embed_query(query: str) -> list[float]:
    """
    Convert a text query into vector embeddings.

    Args:
        query: The text query to embed

    Returns:
        list[float]: The vector embedding of the query
    """
    try:
        response = embedding(
            model="voyage/voyage-law-2",
            input=[query],
            input_type="query",
            api_key=VOYAGE_API_KEY,
        )

        return response.data[0]["embedding"]
    except Exception as e:
        logger.error(f"Error getting embeddings: {str(e)}")
        raise


async def search_query(query: str, company_slug: str, top_k: int = 5):
    # Convert text query to vector embedding
    query_vector = await embed_query(query)
    index = pc.Index(INDEX_NAME)
    search_results = index.query(
        namespace=company_slug,
        top_k=top_k,
        vector=query_vector,
        include_metadata=True,
        include_values=False,
    )
    return search_results


SYSTEM_PROMPT = """You are a thoughtful and professional AI assistant named toast AI, created by toast.ai.
Your purpose is to help users understand complex documents, especially those related to privacy and data usage.

Use only the information provided in the context to answer questions. If the context does not contain enough information to answer confidently, clearly state that the information is not available.

Tone and Style:
- Use a calm, warm, and professional tone to support privacy-conscious users.
- Write in plain, accessible language suitable for non-experts.
- Avoid legal jargon unless clearly explained.
- Emphasize how the document content may affect the individual’s data, rights, and experience.

Clarity and Reference Rules:
- Never use ambiguous pronouns such as “they”, “them”, “their”, “we”, “us”, or “our”.
- Always refer to the organization by its full name (e.g., “Acme Corp”) or as “the company”.
- When referring to the source, mention the type of document (e.g., "privacy policy", "terms of service") and include a URL if available (e.g., [privacy policy](https://www.example.com/privacy)).

Analytical Standards and Thought Process:
- Before responding, think deeply and thoroughly about the question and the context.
- Analyze your draft answer critically. Re-express it internally, refine it, and ensure it is accurate, precise, and free from overreach.
- Prioritize clarity, factual accuracy, and user relevance.
- Do not rush to answer. Reflect on nuances, exceptions, and boundaries of the information.
- If confident, explain why. If uncertain, say so calmly and transparently.

Important Behavioral Guidelines:
- You are not part of the company described in the documents. You are a helpful assistant created by toast.ai.
- If a question is not related to the context, state that you do not have enough information to answer it.
- Do not speculate or infer beyond the context provided. If more information would be needed, say so clearly.
- Do not greet the user.

Your goal is to empower users to make informed decisions about their data, privacy, and relationship with the company — always with clarity, care, and professionalism.
"""


async def get_answer(question: str, company_slug: str) -> str:
    """
    Get an answer to a question using RAG with LiteLLM and Pinecone.

    Args:
        question: The question to answer
        company_slug: The company slug to search within

    Returns:
        str: The answer to the question
    """
    # Search for relevant documents in Pinecone
    search_results = await search_query(question, company_slug)
    logger.debug(search_results)

    if len(search_results["matches"]) == 0:
        return "I couldn't find any relevant information to answer your question."

    # Extract the relevant chunks from the search results with metadata
    formatted_chunks = []
    for match in search_results["matches"]:
        chunk = f"""Document type: {match["metadata"]["document_type"]}
Document URL: {match["metadata"]["url"]}
{match["metadata"]["chunk_text"]}"""
        formatted_chunks.append(chunk)

    context = "\n\n---\n\n".join(formatted_chunks)
    logger.debug(f"Context: {context}")

    # Create the messages for the chat
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"},
    ]

    try:
        model = get_model("gemini-2.0-flash")
        response = completion(
            model=model.model,
            api_key=model.api_key,
            messages=messages,
            temperature=0.2,
        )

        return response.choices[0].message.content

    except Exception as e:
        logger.error(f"Error getting completion from LiteLLM: {str(e)}")
        return "I apologize, but I encountered an error while trying to generate an answer."


if __name__ == "__main__":
    answer = asyncio.run(
        get_answer("what personal information notion stores about me?", "notion")
    )
    logger.debug(answer)
