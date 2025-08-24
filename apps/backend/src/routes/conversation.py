from typing import Any

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from src.conversation import Conversation
from src.core.logging import get_logger
from src.services.conversation_service import conversation_service

logger = get_logger(__name__)

router = APIRouter(prefix="/conversations")


class CreateConversationRequest(BaseModel):
    user_id: str
    company_name: str
    company_slug: str
    company_description: str | None = None
    title: str | None = None
    mode: str | None = None


class SendMessageRequest(BaseModel):
    conversation_id: str
    message: str


class PatchConversationRequest(BaseModel):
    title: str | None = None
    mode: str | None = None
    archived: bool | None = None
    pinned: bool | None = None
    tags: list[str] | None = None
    company_name: str | None = None
    company_description: str | None = None


@router.post("")
async def create_new_conversation(request: CreateConversationRequest) -> Conversation:
    """Create a new conversation."""
    try:
        created_conversation = await conversation_service.create_conversation(
            user_id=request.user_id,
            company_name=request.company_name,
            company_slug=request.company_slug,
            company_description=request.company_description,
            title=request.title,
            mode=request.mode or "qa",
        )
        return created_conversation
    except Exception as e:
        logger.error(f"Error creating conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/{conversation_id}")
async def get_conversation(conversation_id: str) -> Conversation:
    """Get a conversation by ID."""
    try:
        conversation = await conversation_service.get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return conversation
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/user/{user_id}")
async def get_user_conversations_route(
    user_id: str,
    company_slug: str | None = None,
    archived: bool | None = None,
    pinned: bool | None = None,
) -> list[Conversation]:
    """Get all conversations for a user."""
    try:
        query: dict[str, Any] = {"user_id": user_id}
        if company_slug is not None:
            query["company_slug"] = company_slug
        if archived is not None:
            query["archived"] = archived
        if pinned is not None:
            query["pinned"] = pinned

        conversations: list[Conversation] = (
            await conversation_service.db.conversations.find(query)
            .sort("last_message_at", -1)
            .to_list(length=None)
        )
        return conversations
    except Exception as e:
        logger.error(f"Error getting user conversations: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/{conversation_id}/messages")
async def send_message(request: SendMessageRequest) -> dict:
    """Send a message in a conversation."""
    try:
        try:
            result: dict[str, Any] = await conversation_service.send_message(
                request.conversation_id, request.message
            )
            return result
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e)) from e
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending message: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.patch("/{conversation_id}")
async def patch_conversation(conversation_id: str, request: PatchConversationRequest) -> dict:
    """Patch conversation metadata fields."""
    try:
        success = await conversation_service.patch_conversation(
            conversation_id, request.model_dump(exclude_none=True)
        )
        if not success:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error patching conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/{conversation_id}/upload")
async def upload_document(
    conversation_id: str,
    file: UploadFile = File(...),
    company_name: str = Form(...),
    company_description: str = Form(None),
) -> dict:
    """Upload a document to a conversation."""
    try:
        # Read the uploaded file
        content = await file.read()
        try:
            result = await conversation_service.upload_document(
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
            if not result.document:
                raise HTTPException(
                    status_code=500,
                    detail=f"Document processing failed: {result.error_message}",
                )

            return {
                "message": "Document uploaded and processed successfully",
                "document_id": result.document.id,
                "classification": result.document.doc_type,
                "analysis_available": result.analysis is not None,
            }
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e)) from e
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.delete("/{conversation_id}")
async def delete_conversation(conversation_id: str) -> dict:
    """Delete a conversation."""
    try:
        success = await conversation_service.delete_conversation(conversation_id)
        if not success:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e
