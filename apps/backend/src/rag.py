import asyncio
from collections.abc import AsyncGenerator

from dotenv import load_dotenv

from src.agent.agent import Agent
from src.core.logging import get_logger
from src.prompts.rag_prompts import RAG_SYSTEM_PROMPT

load_dotenv()
logger = get_logger(__name__)


async def get_answer_stream(
    question: str, company_slug: str, *, namespace: str | None = None
) -> AsyncGenerator[str, None]:
    """
    Get an answer to a question using the Agent with streaming.

    Args:
        question: The question to answer
        company_slug: The company slug to search within
        namespace: Optional namespace (not used by Agent yet, but kept for API compat)

    Yields:
        str: Chunks of the answer
    """
    agent = Agent(system_prompt=RAG_SYSTEM_PROMPT)

    messages = [{"role": "user", "content": question}]

    # We pass company_slug to the agent so it can use it in tools
    async for chunk in agent.chat(messages, company_slug):
        yield chunk


async def get_answer(question: str, company_slug: str, *, namespace: str | None = None) -> str:
    """
    Get an answer to a question using the Agent (non-streaming wrapper).

    Args:
        question: The question to answer
        company_slug: The company slug to search within
        namespace: Optional namespace

    Returns:
        str: The complete answer
    """
    chunks = []
    async for chunk in get_answer_stream(question, company_slug, namespace=namespace):
        chunks.append(chunk)

    return "".join(chunks)


if __name__ == "__main__":

    async def main() -> None:
        print("Streaming answer:")
        async for chunk in get_answer_stream(
            "what personal information notion stores about me?", "notion"
        ):
            print(chunk, end="", flush=True)
        print("\n")

    asyncio.run(main())
