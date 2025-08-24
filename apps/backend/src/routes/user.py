from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from core.jwt import get_current_user
from models.clerkUser import ClerkUser
from src.services.usage_service import UsageService
from src.services.user_service import user_service
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
    await user_service.upsert_user(user)
    return {"status": "ok", "user_id": user.id}


@router.get("/me")
async def me(current: ClerkUser = Depends(get_current_user)):
    if not current.user_id:
        raise HTTPException(status_code=401, detail="Invalid user")
    user = await user_service.get_user_by_id(current.user_id)
    if user is None:
        # Create minimal user record on first access
        new_user = User(
            id=current.user_id,
            email=current.email,
        )
        await user_service.upsert_user(new_user)
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

    user = await user_service.get_user_by_id(current.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    old_tier = user.tier
    user.tier = req.tier
    await user_service.upsert_user(user)

    return {
        "success": True,
        "user_id": current.user_id,
        "old_tier": old_tier.value,
        "new_tier": req.tier.value,
        "upgraded_at": user.updated_at.isoformat(),
    }


class CompleteOnboardingRequest(BaseModel):
    completed: bool = True


@router.post("/complete-onboarding")
async def complete_onboarding_route(
    _: CompleteOnboardingRequest,
    current: ClerkUser = Depends(get_current_user),
):
    if not current.user_id:
        raise HTTPException(status_code=401, detail="Invalid user")
    await user_service.set_user_onboarding_completed(current.user_id)
    return {"status": "ok"}
