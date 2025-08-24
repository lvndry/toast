from src.repositories import user_repository
from src.user import User


async def create_or_update_user(user: User) -> User:
    return await user_repository.upsert_user(user)


async def get_user(user_id: str) -> User | None:
    return await user_repository.get_user_by_id(user_id)
