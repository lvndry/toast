from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from core.jwt import get_current_user
from models.clerkUser import ClerkUser
from src.services.usage_service import UsageService
from src.services.user_service import (
    complete_onboarding,
    create_or_update_user,
    get_me,
    upgrade_user_tier,
)
from src.user import User, UserTier

router = APIRouter(prefix="/users", tags=["users"])


class CreateUserRequest(BaseModel):
    email: str
    first_name: str | None = None
    last_name: str | None = None


class UpgradeTierRequest(BaseModel):
    tier: UserTier


@router.post("")
async def upsert_user(
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
    await create_or_update_user(user)
    return {"status": "ok", "user_id": user.id}


@router.get("/me")
async def me(current: ClerkUser = Depends(get_current_user)):
    if not current.user_id:
        raise HTTPException(status_code=401, detail="Invalid user")
    user = await get_me(current.user_id)
    if user is None:
        # Create minimal user record on first access
        new_user = User(
            id=current.user_id,
            email=current.email,
        )
        await create_or_update_user(new_user)
        return new_user
    return user


@router.get("/usage")
async def get_usage(current: ClerkUser = Depends(get_current_user)):
    """Get current user's usage information and limits"""
    if not current.user_id:
        raise HTTPException(status_code=401, detail="Invalid user")

    usage_summary = await UsageService.get_usage_summary(current.user_id)
    return usage_summary


@router.post("/upgrade-tier")
async def upgrade_tier(
    req: UpgradeTierRequest,
    current: ClerkUser = Depends(get_current_user),
):
    """Upgrade user's tier"""
    if not current.user_id:
        raise HTTPException(status_code=401, detail="Invalid user")

    result = await upgrade_user_tier(current.user_id, req.tier)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return result


class CompleteOnboardingRequest(BaseModel):
    completed: bool = True


@router.post("/complete-onboarding")
async def complete_onboarding_route(
    _: CompleteOnboardingRequest,
    current: ClerkUser = Depends(get_current_user),
):
    if not current.user_id:
        raise HTTPException(status_code=401, detail="Invalid user")
    await complete_onboarding(current.user_id)
    return {"status": "ok"}
