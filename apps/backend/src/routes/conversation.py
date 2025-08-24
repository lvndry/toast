from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from loguru import logger
from pydantic import BaseModel

from src.services.conversation_service import (
    create_conversation as svc_create_conversation,
)
from src.services.conversation_service import get_conversation as svc_get_conversation
from src.services.conversation_service import (
    list_user_conversations as svc_list_user_conversations,
)
from src.services.conversation_service import send_message as svc_send_message
from src.services.conversation_service import upload_document as svc_upload_document

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
        created_conversation = await svc_create_conversation(
            user_id=request.user_id,
            company_name=request.company_name,
            company_description=request.company_description,
        )
        return created_conversation
    except Exception as e:
        logger.error(f"Error creating conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Get a conversation by ID."""
    try:
        conversation = await svc_get_conversation(conversation_id)
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
        conversations = await svc_list_user_conversations(user_id)
        return conversations
    except Exception as e:
        logger.error(f"Error getting user conversations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{conversation_id}/messages")
async def send_message(request: SendMessageRequest):
    """Send a message in a conversation."""
    try:
        try:
            result = await svc_send_message(request.conversation_id, request.message)
            return result
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
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
        # Read the uploaded file
        content = await file.read()
        try:
            result = await svc_upload_document(
                conversation_id=conversation_id,
                file_content=content,
                filename=file.filename,
                content_type=file.content_type,
                company_name=company_name,
                company_description=company_description,
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

            return {
                "message": "Document uploaded and processed successfully",
                "document_id": result.document.id,  # type: ignore
                "classification": result.document.doc_type,  # type: ignore
                "analysis_available": result.analysis is not None,
            }
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        raise HTTPException(status_code=500, detail=str(e))
