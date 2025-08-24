"""Dashboard database utilities using the new service architecture."""

from src.company import Company
from src.document import Document
from src.services.company_service import company_service
from src.services.document_service import document_service


# Company functions
async def get_all_companies_isolated() -> list[Company]:
    """Get all companies with a fresh database connection"""
    return await company_service.get_all_companies()


async def get_company_by_slug_isolated(slug: str) -> Company | None:
    """Get a company by slug with a fresh database connection"""
    try:
        return await company_service.get_company_by_slug(slug)
    except ValueError:
        return None


async def create_company_isolated(company: Company) -> bool:
    """Create a new company with a fresh database connection"""
    try:
        await company_service.create_company(company)
        return True
    except Exception:
        return False


async def update_company_isolated(company: Company) -> bool:
    """Update an existing company with a fresh database connection"""
    try:
        return await company_service.update_company(company)
    except Exception:
        return False


async def delete_company_isolated(company_id: str) -> bool:
    """Delete a company with a fresh database connection"""
    try:
        return await company_service.delete_company(company_id)
    except Exception:
        return False


# Document functions
async def get_company_documents_isolated(company_slug: str) -> list[Document]:
    """Get all documents for a company with a fresh database connection"""
    return await document_service.get_company_documents(company_slug)


async def get_all_documents_isolated() -> list[Document]:
    """Get all documents with a fresh database connection"""
    return await document_service.get_all_documents()
