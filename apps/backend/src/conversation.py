from datetime import datetime
from typing import Literal

import shortuuid
from pydantic import BaseModel, Field


class Message(BaseModel):
    id: str = Field(default_factory=shortuuid.uuid)
    role: Literal["user", "assistant"]
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)


class Conversation(BaseModel):
    id: str = Field(default_factory=shortuuid.uuid)
    user_id: str
    company_name: str
    company_description: str | None = None
    documents: list[str] = []  # List of document IDs
    messages: list[Message] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
