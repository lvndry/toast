from fastapi import APIRouter, Depends, HTTPException

from src.company import Company
from src.core.jwt import get_optional_user
from src.core.logging import get_logger
from src.document import Document, DocumentAnalysis
from src.models.clerkUser import ClerkUser
from src.services.company_service import company_service
from src.summarizer import MetaSummary, generate_company_meta_summary

logger = get_logger(__name__)

router = APIRouter(prefix="/companies")


@router.get("")
async def get_companies(
    has_documents: bool = True, user: ClerkUser | None = Depends(get_optional_user)
) -> list[Company]:
    """
    Get all companies.

    If has_documents is True, only return companies that have documents.
    """
    companies: list[Company] = await company_service.list_companies_with_documents(
        has_documents=has_documents
    )
    logger.info(f"Found {len(companies)} companies")
    if user is None:
        companies = companies[:100]
    return companies


@router.get("/slug/{slug}")
async def get_company(slug: str) -> Company:
    """Get a company by its slug."""
    try:
        company = await company_service.get_company_by_slug(slug)
        return company
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.get("/{company_id}")
async def get_company_by_id(company_id: str) -> Company:
    """Get a company by its ID."""
    try:
        company = await company_service.get_company_by_id(company_id)
        return company
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.put("/{company_id}/logo")
async def update_logo(company_id: str, logo_url: str) -> Company:
    """Update a company's logo URL."""
    try:
        updated_company = await company_service.update_company_logo(company_id, logo_url)
        return updated_company
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        logger.error(f"Error updating logo for company {company_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update logo") from e


@router.get("/{company_slug}/meta-summary")
async def get_meta_summary(
    company_slug: str, user: ClerkUser | None = Depends(get_optional_user)
) -> DocumentAnalysis:
    """Get or generate a meta summary for a company."""
    try:
        # 1) Try cache first
        cached = await company_service.get_company_meta_summary(company_slug)
        if cached:
            return cached

        # 2) Generate fresh summary
        company = await company_service.get_company_by_slug(company_slug)
        generated: MetaSummary | None = await generate_company_meta_summary(company.slug)
        if not generated:
            raise HTTPException(status_code=500, detail="Failed to generate meta summary")

        # 3) Convert to DocumentAnalysis shape for storage and clients expecting that schema
        analysis_like = {
            "summary": generated.summary,
            "scores": {
                "transparency": {
                    "score": generated.scores.transparency.score,
                    "justification": generated.scores.transparency.justification,
                },
                "data_usage": {
                    "score": generated.scores.data_usage.score,
                    "justification": generated.scores.data_usage.justification,
                },
                "control_and_rights": {
                    "score": generated.scores.control_and_rights.score,
                    "justification": generated.scores.control_and_rights.justification,
                },
                "third_party_sharing": {
                    "score": generated.scores.third_party_sharing.score,
                    "justification": generated.scores.third_party_sharing.justification,
                },
            },
            "keypoints": generated.keypoints or [],
        }

        # 4) Store in DB for future requests
        await company_service.store_company_meta_summary(
            company_slug, DocumentAnalysis(**analysis_like)
        )

        return analysis_like
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.get("/{company_id}/sources")
async def get_sources_for_company(
    company_id: str, user: ClerkUser | None = Depends(get_optional_user)
) -> list[Document]:
    """Get sources for a company."""
    try:
        company = await company_service.get_company_by_id(company_id)
        sources: list[Document] = await company_service.get_company_documents(company.slug)
        return sources
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
