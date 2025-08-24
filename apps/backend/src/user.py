from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class UserTier(str, Enum):
    FREE = "free"
    BUSINESS = "business"
    ENTERPRISE = "enterprise"


class User(BaseModel):
    id: str
    email: str
    first_name: str | None = None
    last_name: str | None = None
    tier: UserTier = UserTier.FREE
    onboarding_completed: bool = False
    # Monthly usage tracking: {"YYYY-MM": count}
    monthly_usage: dict[str, int] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
