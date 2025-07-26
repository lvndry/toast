from fastapi import APIRouter, HTTPException
from loguru import logger

from src.db import (
    get_all_companies,
    get_company_by_id,
    get_company_by_slug,
    store_company_meta_summary,
)
from src.db import get_company_meta_summary as get_stored_meta_summary
from src.summarizer import generate_company_meta_summary

router = APIRouter(prefix="/companies")


@router.get("")
async def get_companies():
    """Get all companies."""
    companies = await get_all_companies()
    return companies


@router.get("/slug/{slug}")
async def get_company(slug: str):
    """Get a company by its slug."""
    try:
        company = await get_company_by_slug(slug)
        return company
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/meta-summary/{company_slug}")
async def get_company_meta_summary(company_slug: str):
    """Get a meta-summary of all documents for a company."""
    # First verify the company exists
    try:
        company = await get_company_by_slug(company_slug)
        if not company:
            raise ValueError(f"Company with slug {company_slug} not found")

        # Try to get existing meta summary from database
        meta_summary = await get_stored_meta_summary(company_slug)

        if meta_summary is None:
            logger.info(f"Generating new meta summary for company {company_slug}")
            # Generate new meta summary if not found in database
            meta_summary = await generate_company_meta_summary(
                company_slug=company_slug
            )
            if meta_summary:
                # Store the generated meta summary in database
                await store_company_meta_summary(company_slug, meta_summary)
            else:
                raise ValueError(
                    f"Failed to generate meta summary for company {company_slug}"
                )

        return meta_summary.model_dump()
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{company_id}")
async def fetch_company_by_id(company_id: str):
    """Get a company by its ID."""
    company = await get_company_by_id(company_id)
    if not company:
        raise HTTPException(
            status_code=404, detail=f"Company with ID {company_id} not found"
        )
    return company
