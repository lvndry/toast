from typing import List

from src.conversation import Conversation, Message
from src.db import add_document_to_conversation as db_add_document_to_conversation
from src.db import add_message_to_conversation as db_add_message_to_conversation
from src.db import create_conversation as db_create_conversation
from src.db import get_conversation_by_id as db_get_conversation_by_id
from src.db import get_user_conversations as db_get_user_conversations
from src.db import update_conversation as db_update_conversation


async def create_conversation(conversation: Conversation) -> Conversation:
    return await db_create_conversation(conversation)


async def get_conversation_by_id(conversation_id: str) -> Conversation | None:
    return await db_get_conversation_by_id(conversation_id)


async def get_user_conversations(user_id: str) -> List[Conversation]:
    return await db_get_user_conversations(user_id)


async def update_conversation(conversation: Conversation):
    return await db_update_conversation(conversation)


async def add_message_to_conversation(conversation_id: str, message: Message):
    return await db_add_message_to_conversation(conversation_id, message)


async def add_document_to_conversation(conversation_id: str, document_id: str):
    return await db_add_document_to_conversation(conversation_id, document_id)
