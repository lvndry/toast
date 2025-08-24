from fastapi import APIRouter, Depends, HTTPException

from core.jwt import get_optional_user
from core.logging import get_logger
from src.services.company_service import company_service
from src.summarizer import generate_company_meta_summary

logger = get_logger(__name__)

router = APIRouter(prefix="/companies")


@router.get("")
async def get_companies(has_documents: bool = True, user=Depends(get_optional_user)):
    """
    Get all companies.

    If has_documents is True, only return companies that have documents.
    """
    companies = await company_service.list_companies_with_documents(has_documents=has_documents)
    if user is None:
        companies = companies[:100]
    return companies


@router.get("/slug/{slug}")
async def get_company(slug: str):
    """Get a company by its slug."""
    try:
        company = await company_service.get_company_by_slug(slug)
        return company
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.get("/{company_id}")
async def get_company_by_id(company_id: str):
    """Get a company by its ID."""
    try:
        company = await company_service.get_company_by_id(company_id)
        return company
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.put("/{company_id}/logo")
async def update_logo(company_id: str, logo_url: str):
    """Update a company's logo URL."""
    try:
        updated_company = await company_service.update_company_logo(company_id, logo_url)
        return updated_company
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        logger.error(f"Error updating logo for company {company_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update logo") from e


@router.get("/{company_id}/meta-summary")
async def get_meta_summary(company_id: str, user=Depends(get_optional_user)):
    """Get or generate a meta summary for a company."""
    try:
        company = await company_service.get_company_by_id(company_id)
        meta_summary = await generate_company_meta_summary(company.slug)
        return meta_summary
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.get("/{company_id}/sources")
async def get_sources_for_company(company_id: str, user=Depends(get_optional_user)):
    """Get sources for a company."""
    try:
        company = await company_service.get_company_by_id(company_id)
        sources = await company_service.get_company_documents(company.slug)
        return sources
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
