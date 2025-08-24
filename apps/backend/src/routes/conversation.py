from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from loguru import logger
from pydantic import BaseModel

from src.conversation import Conversation, Message
from src.db import (
    add_document_to_conversation,
    add_message_to_conversation,
    create_conversation,
    get_conversation_by_id,
    get_user_conversations,
    update_conversation,
)
from src.document_processor import DocumentProcessor
from src.embedding import embed_document
from src.rag import get_answer

router = APIRouter(prefix="/conversations")


class CreateConversationRequest(BaseModel):
    user_id: str
    company_name: str
    company_description: str | None = None


class SendMessageRequest(BaseModel):
    conversation_id: str
    message: str


@router.post("")
async def create_new_conversation(request: CreateConversationRequest):
    """Create a new conversation."""
    try:
        conversation = Conversation(
            user_id=request.user_id,
            company_name=request.company_name,
            company_description=request.company_description,
        )

        created_conversation = await create_conversation(conversation)
        return created_conversation
    except Exception as e:
        logger.error(f"Error creating conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Get a conversation by ID."""
    try:
        conversation = await get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return conversation
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}")
async def get_user_conversations_route(user_id: str):
    """Get all conversations for a user."""
    try:
        conversations = await get_user_conversations(user_id)
        return conversations
    except Exception as e:
        logger.error(f"Error getting user conversations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{conversation_id}/messages")
async def send_message(request: SendMessageRequest):
    """Send a message in a conversation."""
    try:
        conversation = await get_conversation_by_id(request.conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Add user message
        user_message = Message(role="user", content=request.message)
        await add_message_to_conversation(request.conversation_id, user_message)

        # Generate AI response using RAG
        # For now, we'll use a simple response. In the future, this should use the documents in the conversation
        # Use conversation namespace for uploaded docs
        ai_response = await get_answer(
            request.message, conversation.company_name, namespace=conversation.id
        )

        # Add AI message
        ai_message = Message(role="assistant", content=ai_response)
        await add_message_to_conversation(request.conversation_id, ai_message)

        return {"user_message": user_message, "ai_message": ai_message}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending message: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{conversation_id}/upload")
async def upload_document(
    conversation_id: str,
    file: UploadFile = File(...),
    company_name: str = Form(...),
    company_description: str = Form(None),
):
    """Upload a document to a conversation."""
    try:
        conversation = await get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Read the uploaded file
        content = await file.read()

        # Process the document using the new document processor
        processor = DocumentProcessor()
        result = await processor.process_document(
            file_content=content,
            filename=file.filename,
            content_type=file.content_type,
            company_id=conversation.id,
        )

        if not result.success:
            if not result.is_legal_document:
                raise HTTPException(
                    status_code=400,
                    detail="Document is not classified as a legal document. Please upload a legal document such as a privacy policy, terms of service, or similar legal document.",
                )
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"Document processing failed: {result.error_message}",
                )

        # Add document to conversation and embed into conversation namespace
        await add_document_to_conversation(conversation_id, result.document.id)
        try:
            await embed_document(result.document, namespace=conversation.id)
        except Exception as e:
            logger.warning(f"Embedding uploaded document failed: {e}")

        # Update conversation with company info if provided
        if company_name or company_description:
            conversation.company_name = company_name or conversation.company_name
            conversation.company_description = (
                company_description or conversation.company_description
            )
            await update_conversation(conversation)

        return {
            "message": "Document uploaded and processed successfully",
            "document_id": result.document.id,
            "classification": result.document.doc_type,
            "analysis_available": result.analysis is not None,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        raise HTTPException(status_code=500, detail=str(e))
