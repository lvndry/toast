from fastapi import APIRouter, Depends, HTTPException

from src.company import Company
from src.core.jwt import get_optional_user
from src.core.logging import get_logger
from src.document import Document, MetaSummary
from src.models.clerkUser import ClerkUser
from src.services.company_service import company_service
from src.services.user_service import user_service
from src.summarizer import generate_company_meta_summary
from src.user import UserTier

logger = get_logger(__name__)

router = APIRouter(prefix="/companies")


@router.get("")
async def get_companies(
    has_documents: bool = True, user: ClerkUser | None = Depends(get_optional_user)
) -> list[Company]:
    """
    Get companies visible to user's tier.

    If has_documents is True, only return companies that have documents.
    """

    # Determine user tier
    user_tier = UserTier.FREE
    if user:
        db_user = await user_service.get_user_by_id(user.user_id)
        if db_user:
            user_tier = db_user.tier

    # Get companies filtered by tier
    companies: list[Company] = await company_service.get_companies_by_tier(user_tier)

    # Apply document filter if requested
    if has_documents:
        companies_with_docs = await company_service.list_companies_with_documents(
            has_documents=True
        )
        # Filter to only include companies visible to user's tier
        company_ids_with_docs = {c.id for c in companies_with_docs}
        companies = [c for c in companies if c.id in company_ids_with_docs]

    # Limit results for free tier
    if user_tier == UserTier.FREE:
        companies = companies[:50]  # Show fewer companies to free users

    logger.info(f"Found {len(companies)} companies for tier {user_tier.value}")
    return companies


@router.get("/{slug}")
async def get_company(slug: str, user: ClerkUser | None = Depends(get_optional_user)) -> Company:
    """Get a company by its slug with tier visibility check."""

    # Determine user tier
    user_tier = UserTier.FREE
    if user:
        db_user = await user_service.get_user_by_id(user.user_id)
        if db_user:
            user_tier = db_user.tier

    company = await company_service.get_company_by_slug_with_tier_check(slug, user_tier)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    return company


@router.get("/{slug}/meta-summary")
async def get_company_meta_summary(
    slug: str, user: ClerkUser | None = Depends(get_optional_user)
) -> MetaSummary:
    """Get meta summary for a company with tier visibility check."""

    # Determine user tier
    user_tier = UserTier.FREE
    if user:
        db_user = await user_service.get_user_by_id(user.user_id)
        if db_user:
            user_tier = db_user.tier

    # Check tier access first
    company = await company_service.get_company_by_slug_with_tier_check(slug, user_tier)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Generate meta summary
    meta_summary = await generate_company_meta_summary(slug)
    return meta_summary


@router.get("/{slug}/documents")
async def get_company_documents(
    slug: str, user: ClerkUser | None = Depends(get_optional_user)
) -> list[Document]:
    """Get documents for a company with tier visibility check."""

    # Determine user tier
    user_tier = UserTier.FREE
    if user:
        db_user = await user_service.get_user_by_id(user.user_id)
        if db_user:
            user_tier = db_user.tier

    # Check tier access first
    company = await company_service.get_company_by_slug_with_tier_check(slug, user_tier)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Get documents
    documents: list[Document] = await company_service.get_company_documents(company.id)
    return documents
