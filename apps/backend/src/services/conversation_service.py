"""Conversation service for managing conversation operations."""

from datetime import datetime
from typing import ClassVar

from core.logging import get_logger
from src.conversation import Conversation, Message
from src.document_processor import DocumentProcessor
from src.embedding import embed_document
from src.rag import get_answer
from src.services.base_service import BaseService

logger = get_logger(__name__)


class ConversationService(BaseService):
    """Service for conversation-related database operations."""

    _instance: ClassVar["ConversationService"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def create_conversation(
        self, user_id: str, company_name: str, company_description: str | None = None
    ) -> Conversation:
        """Create a new conversation."""
        conversation = Conversation(
            user_id=user_id,
            company_name=company_name,
            company_description=company_description,
        )
        return await self._create_conversation(conversation)

    async def _create_conversation(self, conversation: Conversation) -> Conversation:
        """Create a new conversation in the database."""
        try:
            await self.db.conversations.insert_one(conversation.model_dump(mode="json"))
            logger.info(f"Created conversation {conversation.id}")
            return conversation
        except Exception as e:
            logger.error(f"Error creating conversation {conversation.id}: {e}")
            raise e

    async def get_conversation_by_id(self, conversation_id: str) -> Conversation | None:
        """Get a conversation by its ID."""
        try:
            conversation_doc = await self.db.conversations.find_one({"id": conversation_id})
            return Conversation(**conversation_doc) if conversation_doc else None
        except Exception as e:
            logger.error(f"Error getting conversation {conversation_id}: {e}")
            return None

    async def get_user_conversations(self, user_id: str) -> list[Conversation]:
        """Get all conversations for a user."""
        try:
            conversations = await self.db.conversations.find({"user_id": user_id}).to_list(
                length=None
            )
            return [Conversation(**conversation) for conversation in conversations]
        except Exception as e:
            logger.error(f"Error getting conversations for user {user_id}: {e}")
            raise e

    async def update_conversation(self, conversation: Conversation) -> bool:
        """Update a conversation in the database."""
        try:
            conversation.updated_at = datetime.now()
            result = await self.db.conversations.update_one(
                {"id": conversation.id},
                {"$set": conversation.model_dump(mode="json")},
            )
            success = result.modified_count > 0
            if success:
                logger.info(f"Updated conversation {conversation.id}")
            else:
                logger.warning(f"No conversation found with id {conversation.id} to update")
            return success
        except Exception as e:
            logger.error(f"Error updating conversation {conversation.id}: {e}")
            raise e

    async def delete_conversation(self, conversation_id: str) -> bool:
        """Delete a conversation from the database."""
        try:
            result = await self.db.conversations.delete_one({"id": conversation_id})
            success = result.deleted_count > 0
            if success:
                logger.info(f"Deleted conversation {conversation_id}")
            else:
                logger.warning(f"No conversation found with id {conversation_id} to delete")
            return success
        except Exception as e:
            logger.error(f"Error deleting conversation {conversation_id}: {e}")
            raise e

    async def add_message_to_conversation(self, conversation_id: str, message: Message) -> bool:
        """Add a message to a conversation."""
        try:
            result = await self.db.conversations.update_one(
                {"id": conversation_id},
                {
                    "$push": {"messages": message.model_dump(mode="json")},
                    "$set": {"updated_at": datetime.now()},
                },
            )
            success = result.modified_count > 0
            if success:
                logger.info(f"Added message to conversation {conversation_id}")
            else:
                logger.warning(f"No conversation found with id {conversation_id} to add message")
            return success
        except Exception as e:
            logger.error(f"Error adding message to conversation {conversation_id}: {e}")
            raise e

    async def add_document_to_conversation(self, conversation_id: str, document_id: str) -> bool:
        """Add a document to a conversation."""
        try:
            result = await self.db.conversations.update_one(
                {"id": conversation_id},
                {"$push": {"documents": document_id}, "$set": {"updated_at": datetime.now()}},
            )
            success = result.modified_count > 0
            if success:
                logger.info(f"Added document {document_id} to conversation {conversation_id}")
            else:
                logger.warning(f"No conversation found with id {conversation_id} to add document")
            return success
        except Exception as e:
            logger.error(f"Error adding document to conversation {conversation_id}: {e}")
            raise e

    async def get_conversation_messages(self, conversation_id: str) -> list[Message]:
        """Get all messages for a conversation."""
        try:
            conversation = await self.get_conversation_by_id(conversation_id)
            return conversation.messages if conversation else []
        except Exception as e:
            logger.error(f"Error getting messages for conversation {conversation_id}: {e}")
            return []

    async def get_conversation_documents(self, conversation_id: str) -> list[str]:
        """Get all document IDs for a conversation."""
        try:
            conversation = await self.get_conversation_by_id(conversation_id)
            return conversation.documents if conversation else []
        except Exception as e:
            logger.error(f"Error getting documents for conversation {conversation_id}: {e}")
            return []

    async def get_all_conversations(self) -> list[Conversation]:
        """Get all conversations from the database."""
        try:
            conversations = await self.db.conversations.find().to_list(length=None)
            return [Conversation(**conversation) for conversation in conversations]
        except Exception as e:
            logger.error(f"Error getting all conversations: {e}")
            raise e

    async def send_message(self, conversation_id: str, message_text: str) -> dict:
        """Send a message in a conversation and get AI response."""
        conversation = await self.get_conversation_by_id(conversation_id)
        if not conversation:
            raise ValueError("Conversation not found")

        user_message = Message(role="user", content=message_text)
        await self.add_message_to_conversation(conversation_id, user_message)

        ai_response = await get_answer(
            message_text, conversation.company_name, namespace=conversation.id
        )
        ai_message = Message(role="assistant", content=ai_response)
        await self.add_message_to_conversation(conversation_id, ai_message)

        return {"user_message": user_message, "ai_message": ai_message}

    async def upload_document(
        self,
        conversation_id: str,
        file_content: bytes,
        filename: str,
        content_type: str,
        company_name: str | None = None,
        company_description: str | None = None,
    ):
        """Upload a document to a conversation."""
        conversation = await self.get_conversation_by_id(conversation_id)
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

        await self.add_document_to_conversation(conversation_id, result.document.id)
        try:
            await embed_document(result.document, namespace=conversation.id)
        except Exception as e:
            logger.warning(f"Embedding uploaded document failed: {e}")

        if company_name or company_description:
            conversation.company_name = company_name or conversation.company_name
            conversation.company_description = (
                company_description or conversation.company_description
            )
            await self.update_conversation(conversation)

        return result


# Global instance
conversation_service = ConversationService()
