"""Company service for managing company operations."""

from datetime import datetime
from typing import ClassVar

from core.logging import get_logger
from src.company import Company
from src.document import Document, DocumentAnalysis
from src.services.base_service import BaseService
from src.services.document_service import document_service

logger = get_logger(__name__)


class CompanyService(BaseService):
    """Service for company-related database operations."""

    _instance: ClassVar["CompanyService"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def get_company_by_id(self, company_id: str) -> Company:
        """Get a company by its ID."""
        company = await self.db.companies.find_one({"id": company_id})
        if not company:
            raise ValueError(f"Company with id {company_id} not found")
        return Company(**company)

    async def get_company_by_slug(self, slug: str) -> Company:
        """Get a company by its slug."""
        company = await self.db.companies.find_one({"slug": slug})
        if not company:
            raise ValueError(f"Company with slug {slug} not found")
        return Company(**company)

    async def get_all_companies(self) -> list[Company]:
        """Get all companies from the database."""
        companies = await self.db.companies.find().to_list(length=None)
        return [Company(**company) for company in companies]

    async def create_company(self, company: Company) -> Company:
        """Create a new company in the database."""
        try:
            company_dict = company.model_dump()
            await self.db.companies.insert_one(company_dict)
            logger.info(f"Created company {company.name} with ID {company.id}")
            return company
        except Exception as e:
            logger.error(f"Error creating company {company.name}: {e}")
            raise e

    async def update_company(self, company: Company) -> bool:
        """Update a company in the database."""
        try:
            result = await self.db.companies.update_one(
                {"id": company.id}, {"$set": company.model_dump()}
            )
            success = result.modified_count > 0
            if success:
                logger.info(f"Updated company {company.id}")
            else:
                logger.warning(f"No company found with id {company.id} to update")
            return success
        except Exception as e:
            logger.error(f"Error updating company {company.id}: {e}")
            raise e

    async def delete_company(self, company_id: str) -> bool:
        """Delete a company from the database."""
        try:
            result = await self.db.companies.delete_one({"id": company_id})
            success = result.deleted_count > 0
            if success:
                logger.info(f"Deleted company {company_id}")
            else:
                logger.warning(f"No company found with id {company_id} to delete")
            return success
        except Exception as e:
            logger.error(f"Error deleting company {company_id}: {e}")
            raise e

    async def update_company_logo(self, company_id: str, logo_url: str) -> Company:
        """Update a company's logo URL."""
        company = await self.get_company_by_id(company_id)
        company.logo = logo_url
        await self.update_company(company)
        return company

    async def get_company_documents(self, company_slug: str) -> list[Document]:
        """Get all documents for a company."""
        return await document_service.get_company_documents(company_slug)

    async def get_company_meta_summary(self, company_slug: str) -> DocumentAnalysis | None:
        """Get a meta summary for a company from the database."""
        try:
            company = await self.get_company_by_slug(company_slug)
            meta_summary_doc = await self.db.meta_summaries.find_one({"company_id": company.id})
            if meta_summary_doc:
                return DocumentAnalysis(**meta_summary_doc["analysis"])
            return None
        except Exception as e:
            logger.error(f"Error getting meta summary for {company_slug}: {e}")
            return None

    async def store_company_meta_summary(self, company_slug: str, meta_summary: DocumentAnalysis):
        """Store a meta summary for a company in the database."""
        try:
            company = await self.get_company_by_slug(company_slug)
            meta_summary_doc = {
                "company_id": company.id,
                "company_slug": company_slug,
                "analysis": meta_summary.model_dump(),
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
            }

            # Use upsert to either insert new or update existing
            await self.db.meta_summaries.update_one(
                {"company_id": company.id}, {"$set": meta_summary_doc}, upsert=True
            )
            logger.info(f"Stored meta summary for company {company_slug}")
        except Exception as e:
            logger.error(f"Error storing meta summary for {company_slug}: {e}")
            raise e

    async def list_companies_with_documents(self, has_documents: bool = True) -> list[Company]:
        """Get companies, optionally filtered by whether they have documents."""
        companies = await self.get_all_companies()
        if has_documents:
            filtered = []
            for company in companies:
                documents = await self.get_company_documents(company.slug)
                if documents:
                    filtered.append(company)
            return filtered
        return companies


# Global instance
company_service = CompanyService()
