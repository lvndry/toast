from fastapi import APIRouter, Depends, HTTPException
from loguru import logger

from core.jwt import get_optional_user
from src.services.company_service import get_company_by_id as svc_get_company_by_id
from src.services.company_service import get_company_by_slug as svc_get_company_by_slug
from src.services.company_service import get_or_generate_meta_summary, get_sources, list_companies
from src.services.usage_service import UsageService

router = APIRouter(prefix="/companies")


@router.get("")
async def get_companies(has_documents: bool = True, user=Depends(get_optional_user)):
    """
    Get all companies.

    If has_documents is True, only return companies that have documents.
    """
    companies = await list_companies(has_documents=has_documents)
    if user is None:
        companies = companies[:100]
    return companies


@router.get("/slug/{slug}")
async def get_company(slug: str):
    """Get a company by its slug."""
    try:
        company = await svc_get_company_by_slug(slug)
        return company
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.get("/meta-summary/{company_slug}")
async def get_company_meta_summary(company_slug: str, user=Depends(get_optional_user)):
    """Get a meta-summary of all documents for a company."""
    # First verify the company exists
    try:
        company = await svc_get_company_by_slug(company_slug)
        if not company:
            raise ValueError(f"Company with slug {company_slug} not found")

        # Check usage limits if user is authenticated
        if user:
            # Check if user has exceeded their monthly limit
            allowed, usage_info = await UsageService.check_usage_limit(user.user_id)

            if not allowed:
                raise HTTPException(
                    status_code=429,
                    detail={
                        "message": "Monthly usage limit exceeded",
                        "usage": usage_info,
                        "upgrade_message": f"Upgrade to {usage_info['tier']} tier for higher limits",
                    },
                )

            # Increment usage counter
            success = await UsageService.increment_usage(user.user_id, "meta_summary")
            if not success:
                logger.warning(f"Failed to increment usage for user {user.user_id}")

        return await get_or_generate_meta_summary(company_slug)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.get("/{company_slug}/sources")
async def get_company_sources(company_slug: str):
    """Get all documents (sources) for a company."""
    try:
        return await get_sources(company_slug)
    except ValueError as e:
        logger.error(f"Error fetching sources for company {company_slug}: {e}")
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.get("/{company_id}")
async def fetch_company_by_id(company_id: str):
    """Get a company by its ID."""
    company = await svc_get_company_by_id(company_id)
    if not company:
        raise HTTPException(status_code=404, detail=f"Company with ID {company_id} not found")
    return company
