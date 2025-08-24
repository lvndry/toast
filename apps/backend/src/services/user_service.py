from src.db import get_user_by_id, set_user_onboarding_completed
from src.repositories import user_repository
from src.user import User


async def get_me(user_id: str) -> User | None:
    return await get_user_by_id(user_id)


async def complete_onboarding(user_id: str) -> None:
    await set_user_onboarding_completed(user_id)


async def create_or_update_user(user: User) -> User:
    return await user_repository.upsert_user(user)


async def get_user(user_id: str) -> User | None:
    return await user_repository.get_user_by_id(user_id)
