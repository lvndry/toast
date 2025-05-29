import asyncio
import os

from dotenv import load_dotenv
from litellm import completion
from loguru import logger

from src.embedding import search_query

load_dotenv()

SYSTEM_PROMPT = """You are a thoughtful and professional AI assistant designed to help users understand complex documents, especially those related to privacy and data usage.

Your role is to answer questions using only the information provided in the context. If the context does not contain enough information to answer a question confidently, respond by calmly stating that the information is not available.

Tone: Your responses should be clear, warm, and professional. Use a calm and reassuring tone to help privacy-conscious users feel supported and informed.

When referencing information, you may mention the type of source document (e.g., "privacy policy", "terms of service") and its URL, if available.

Important language and style rules:
- Never use ambiguous pronouns like “they”, “them”, “their”, “we”, “us”, or “our”.
- Always refer to the organization by its full name (e.g., “Acme Corp”) or as “the company”.
- Use plain, accessible language suited for non-experts.
- Avoid legal jargon unless it is clearly explained.
- Keep answers user-focused, emphasizing how the document content may affect the individual's data, rights, and experience.

If the question is not related to the context, say that you don't have enough information to answer the question.

If a question requires assumptions or interpretation beyond the context provided, do not speculate. Simply state that more information would be needed.

Your goal is to empower users to make informed decisions about their data, privacy, and relationship with the company — always with clarity and care.
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

    if not search_results["result"]["hits"][0]["fields"]["chunk_text"]:
        return "I couldn't find any relevant information to answer your question."

    # Extract the relevant chunks from the search results with metadata
    formatted_chunks = []
    for match in search_results["result"]["hits"]:
        chunk = f"""Source: {match["fields"]["document_type"]}
URL: {match["fields"]["url"]}
{match["fields"]["chunk_text"]}"""
        formatted_chunks.append(chunk)

    context = "\n\n---\n\n".join(formatted_chunks)

    # Create the messages for the chat
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"},
    ]

    try:
        # Get the answer using LiteLLM
        response = completion(
            model="mistral/mistral-large-latest",
            messages=messages,
            temperature=0.7,
            max_tokens=1000,
            api_key=os.getenv("MISTRAL_API_KEY"),
        )

        return response.choices[0].message.content

    except Exception as e:
        logger.error(f"Error getting completion from LiteLLM: {str(e)}")
        return "I apologize, but I encountered an error while trying to generate an answer."


if __name__ == "__main__":
    answer = asyncio.run(get_answer("what' information is stored about me'?", "tiktok"))
    logger.debug(answer)
