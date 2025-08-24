from core.jwt import get_current_user
from fastapi import APIRouter, Depends, HTTPException
from models.clerkUser import ClerkUser
from pydantic import BaseModel

from src.db import upsert_user
from src.user import User

router = APIRouter(prefix="/users", tags=["users"])


class CreateUserRequest(BaseModel):
    email: str
    first_name: str | None = None
    last_name: str | None = None


@router.post("")
async def create_or_update_user(
    req: CreateUserRequest,
    current: ClerkUser = Depends(get_current_user),
):
    if not current.user_id:
        raise HTTPException(status_code=401, detail="Invalid user")

    user = User(
        id=current.user_id,
        email=req.email or current.email,
        first_name=req.first_name,
        last_name=req.last_name,
    )
    await upsert_user(user)
    return {"status": "ok", "user_id": user.id}
