from loguru import logger

from src.conversation import Conversation, Message
from src.document_processor import DocumentProcessor
from src.embedding import embed_document
from src.rag import get_answer
from src.repositories import conversation_repository


async def create_conversation(
    user_id: str, company_name: str, company_description: str | None
) -> Conversation:
    conversation = Conversation(
        user_id=user_id,
        company_name=company_name,
        company_description=company_description,
    )
    return await conversation_repository.create_conversation(conversation)


async def get_conversation(conversation_id: str) -> Conversation | None:
    return await conversation_repository.get_conversation_by_id(conversation_id)


async def list_user_conversations(user_id: str):
    return await conversation_repository.get_user_conversations(user_id)


async def send_message(conversation_id: str, message_text: str) -> dict:
    conversation = await conversation_repository.get_conversation_by_id(conversation_id)
    if not conversation:
        raise ValueError("Conversation not found")

    user_message = Message(role="user", content=message_text)
    await conversation_repository.add_message_to_conversation(
        conversation_id, user_message
    )

    ai_response = await get_answer(
        message_text, conversation.company_name, namespace=conversation.id
    )
    ai_message = Message(role="assistant", content=ai_response)
    await conversation_repository.add_message_to_conversation(
        conversation_id, ai_message
    )

    return {"user_message": user_message, "ai_message": ai_message}


async def upload_document(
    conversation_id: str,
    file_content: bytes,
    filename: str,
    content_type: str,
    company_name: str | None,
    company_description: str | None,
):
    conversation = await conversation_repository.get_conversation_by_id(conversation_id)
    if not conversation:
        raise ValueError("Conversation not found")

    processor = DocumentProcessor()
    result = await processor.process_document(
        file_content=file_content,
        filename=filename,
        content_type=content_type,
        company_id=conversation.id,
    )

    if not result.success:
        return result

    await conversation_repository.add_document_to_conversation(
        conversation_id, result.document.id
    )  # type: ignore
    try:
        await embed_document(result.document, namespace=conversation.id)  # type: ignore
    except Exception as e:
        logger.warning(f"Embedding uploaded document failed: {e}")

    if company_name or company_description:
        conversation.company_name = company_name or conversation.company_name
        conversation.company_description = (
            company_description or conversation.company_description
        )
        await conversation_repository.update_conversation(conversation)

    return result
