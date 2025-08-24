import asyncio

from dotenv import load_dotenv
from litellm import completion, embedding
from loguru import logger

from src.models import get_model
from src.vector_db import INDEX_NAME, pc

load_dotenv()


async def embed_query(query: str) -> list[float]:
    """
    Convert a text query into vector embeddings.

    Args:
        query: The text query to embed

    Returns:
        list[float]: The vector embedding of the query
    """
    model = get_model("voyage-law-2")
    try:
        response = embedding(
            model=model.model,
            api_key=model.api_key,
            input=[query],
            input_type="query",
        )

        return response.data[0]["embedding"]
    except Exception as e:
        logger.error(f"Error getting embeddings: {str(e)}")
        raise


async def search_query(
    query: str, company_slug: str, top_k: int = 12, *, namespace: str | None = None
):
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
    return search_results


SYSTEM_PROMPT = """You are a thoughtful and professional AI assistant.
Your purpose is to help users understand and explain the legal documents of a company (e.g. privacy policy, terms of service, etc.).
Your goal is to empower users to make informed decisions about their data, privacy, and relationship with the company.

Use only the information provided in the context to answer questions. If the context does not contain enough information to answer confidently, clearly state that the information is not available and ask the user to elaborate on the question.

Style and Language Guidelines:
- Use plain, precise, and human-centered language. Avoid legal or technical jargon.
- Never use ambiguous pronouns such as “they”, “them”, “their”, “we”, “us”, or “our”.
- Always refer to the organization by its full name (e.g., “Acme Corp”) or as “the company”.
- Assume the reader is privacy-conscious but not a lawyer or policy expert.
- Prioritize clarity, honesty, and practical insight over word-for-word fidelity to legal phrasing.
- You should exactly stick to the content of the document, and not add any additional information.
- When referring to the source, mention the type of document (e.g., "privacy policy", "terms of service") and include a URL if available (e.g., [privacy policy](https://www.example.com/privacy)). The title is part of the context.

Analytical Guidelines:
- Think critically and revise your own answer to ensure clarity, accuracy, and completeness before returning it.
- Focus on user impact: what users should expect, what rights they have, what risks or benefits they face.
- Be especially attentive to data collection, use, sharing, third-party access, retention, security, and user rights when mentioned in the document.
- Identify any permissions granted to the company or obligations imposed on users.
- Highlight any potentially surprising, invasive, or beneficial aspects of the document.
- Avoid speculation. If a detail is unclear or missing, say so.

Cognitive Process:
- Think through your analysis carefully and double-check for clarity and accuracy.
- If the context lacks enough information to answer confidently, say so rather than guessing.

Analytical Standards and Thought Process:
- Before responding, think deeply and thoroughly about the question and the context.
- Analyze your draft answer critically. Re-express it internally, refine it, and ensure it is accurate, precise, and free from overreach.
- Prioritize clarity, factual accuracy, and user relevance.
- Do not rush to answer. Reflect on nuances, exceptions, and boundaries of the information.
- If confident, explain why. If uncertain, say so clearly and transparently.

Important Behavioral Guidelines:
- You are not part of the company described in the documents.
- If a question is not related to the context, state that you do not have enough information to answer it.
- Do not speculate or infer beyond the context provided. If more information would be needed, say so clearly.
- Do not greet the user.
"""


async def get_answer(
    question: str, company_slug: str, *, namespace: str | None = None
) -> str:
    """
    Get an answer to a question using RAG with LiteLLM and Pinecone.

    Args:
        question: The question to answer
        company_slug: The company slug to search within

    Returns:
        str: The answer to the question
    """
    # Search for relevant documents in Pinecone
    search_results = await search_query(question, company_slug, namespace=namespace)
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
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"},
    ]

    try:
        model = get_model("mistral-small")
        response = completion(
            model=model.model,
            api_key=model.api_key,
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
        return answer_text
    except Exception as e:
        logger.error(f"Error getting completion from LiteLLM: {str(e)}")
        return "I apologize, but I encountered an error while trying to generate an answer."


if __name__ == "__main__":
    answer = asyncio.run(
        get_answer("what personal information notion stores about me?", "notion")
    )
    logger.info(answer)
