from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from src.db import get_all_companies, get_company_by_slug, mongo
from src.summarizer import generate_company_meta_summary

router = APIRouter(prefix="/companies")


@router.get("")
async def get_companies():
    """Get all companies."""
    companies = await get_all_companies()
    return {"companies": companies}


@router.get("/slug/{slug}")
async def get_company(slug: str):
    """Get a company by its slug."""
    try:
        company = await get_company_by_slug(slug)
        return company
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/meta-summary/{company_id}")
async def get_company_meta_summary(company_id: str):
    """Get a meta-summary of all documents for a company."""
    # First verify the company exists
    company = await mongo.db.companies.find_one({"id": company_id})
    if not company:
        raise HTTPException(
            status_code=404, detail=f"Company with ID {company_id} not found"
        )

    # Get all documents for the company
    documents = await mongo.db.documents.find({"company_id": company_id}).to_list(
        length=None
    )
    if not documents:
        raise HTTPException(
            status_code=404, detail=f"No documents found for company {company_id}"
        )

    # Filter documents that have analysis
    documents_with_analysis = [doc for doc in documents if doc.get("analysis")]
    if not documents_with_analysis:
        raise HTTPException(
            status_code=404,
            detail=f"No analyzed documents found for company {company_id}",
        )

    return StreamingResponse(
        generate_company_meta_summary(documents_with_analysis), media_type="text/plain"
    )


@router.get("/{company_id}")
async def get_company_by_id(company_id: str):
    """Get a company by its ID."""
    company = await mongo.db.companies.find_one({"id": company_id})
    if not company:
        raise HTTPException(
            status_code=404, detail=f"Company with ID {company_id} not found"
        )
    return company
