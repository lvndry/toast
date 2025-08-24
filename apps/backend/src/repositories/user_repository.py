from src.db import get_user_by_id as db_get_user_by_id
from src.db import upsert_user as db_upsert_user
from src.user import User


async def upsert_user(user: User) -> User:
    return await db_upsert_user(user)


async def get_user_by_id(user_id: str) -> User | None:
    return await db_get_user_by_id(user_id)
