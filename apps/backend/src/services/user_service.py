from datetime import datetime

from src.db import get_user_by_id, set_user_onboarding_completed, upsert_user
from src.repositories import user_repository
from src.user import User, UserTier


async def get_me(user_id: str) -> User | None:
    return await get_user_by_id(user_id)


async def complete_onboarding(user_id: str) -> None:
    await set_user_onboarding_completed(user_id)


async def create_or_update_user(user: User) -> User:
    return await user_repository.upsert_user(user)


async def get_user(user_id: str) -> User | None:
    return await user_repository.get_user_by_id(user_id)


async def update_user_tier(user_id: str, tier: UserTier) -> User | None:
    """Update a user's tier"""
    user = await get_user_by_id(user_id)
    if not user:
        return None

    user.tier = tier
    user.updated_at = datetime.now()

    await upsert_user(user)
    return user


async def upgrade_user_tier(user_id: str, new_tier: UserTier) -> dict:
    """Upgrade a user's tier and return upgrade information"""
    user = await get_user_by_id(user_id)
    if not user:
        return {"error": "User not found"}

    old_tier = user.tier
    user.tier = new_tier
    user.updated_at = datetime.now()

    await upsert_user(user)

    return {
        "success": True,
        "user_id": user_id,
        "old_tier": old_tier.value,
        "new_tier": new_tier.value,
        "upgraded_at": user.updated_at.isoformat(),
    }
