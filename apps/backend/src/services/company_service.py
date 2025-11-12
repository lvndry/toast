"""Company service for managing company operations."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import HTTPException

from src.company import Company
from src.core.logging import get_logger
from src.document import Document, DocumentAnalysis
from src.exceptions import CompanyNotFoundError
from src.services.base_service import BaseService
from src.summarizer import MetaSummary
from src.user import UserTier

logger = get_logger(__name__)


class CompanyService(BaseService):
    """Service for company-related database operations."""

    _instance: CompanyService | None = None

    def __new__(cls) -> CompanyService:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def get_company_by_id(self, company_id: str) -> Company:
        """Get a company by its ID."""
        company = await self.db.companies.find_one({"id": company_id})
        if not company:
            raise CompanyNotFoundError(company_id=company_id)
        return Company(**company)

    async def get_company_by_slug(self, slug: str) -> Company:
        """Get a company by its slug."""
        company = await self.db.companies.find_one({"slug": slug})
        if not company:
            raise CompanyNotFoundError(slug=slug)
        return Company(**company)

    async def get_companies_by_tier(self, user_tier: UserTier) -> list[Company]:
        """Get companies visible to a specific user tier."""
        companies = await self.db.companies.find(
            {"visible_to_tiers": {"$in": [user_tier.value]}}
        ).to_list(length=None)

        return [Company(**company) for company in companies]

    async def get_company_by_slug_with_tier_check(
        self, slug: str, user_tier: UserTier
    ) -> Company | None:
        """Get company by slug, checking tier visibility."""
        company = await self.db.companies.find_one({"slug": slug})
        if not company:
            return None

        company_obj = Company(**company)
        if user_tier not in company_obj.visible_to_tiers:
            next_tier = self._get_next_tier(user_tier)
            raise HTTPException(
                status_code=403, detail=f"This company requires {next_tier.value} tier or higher"
            )
        return company_obj

    def _get_next_tier(self, current_tier: UserTier) -> UserTier:
        """Get the next tier up from current tier."""
        tier_order = [UserTier.FREE, UserTier.BUSINESS, UserTier.ENTERPRISE]
        try:
            current_index = tier_order.index(current_tier)
            if current_index < len(tier_order) - 1:
                return tier_order[current_index + 1]
            return current_tier
        except ValueError:
            return UserTier.BUSINESS

    async def get_all_companies(self) -> list[Company]:
        """Get all companies from the database."""
        companies = await self.db.companies.find().to_list(length=None)
        return [Company(**company) for company in companies]

    async def list_companies_with_documents(self, has_documents: bool = True) -> list[Company]:
        """Get companies that have documents."""
        if has_documents:
            # Get company IDs that have documents using a simple aggregation
            company_ids_with_docs = await self.db.documents.distinct("company_id")

            # Get companies by their IDs
            companies = await self.db.companies.find(
                {"id": {"$in": company_ids_with_docs}},
                {"_id": 0},
            ).to_list(length=None)
            logger.info(f"Found {len(companies)} companies with documents")
            return [Company(**company) for company in companies]
        else:
            return await self.get_all_companies()

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
            return bool(success)
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
            return bool(success)
        except Exception as e:
            logger.error(f"Error deleting company {company_id}: {e}")
            raise e

    async def update_company_logo(self, company_id: str, logo_url: str) -> Company:
        """Update a company's logo URL."""
        company = await self.get_company_by_id(company_id)
        company.logo = logo_url
        await self.update_company(company)
        return company

    async def get_company_documents(self, company_id: str) -> list[Document]:
        """Get all documents for a specific company."""
        documents = await self.db.documents.find({"company_id": company_id}).to_list(length=None)
        return [Document(**doc) for doc in documents]

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

    async def get_cached_meta_summary(self, company_slug: str) -> dict[str, Any] | None:
        """
        Get cached meta-summary data including document signature.

        Returns:
            Dictionary with 'meta_summary', 'document_signature', and metadata, or None if not found
        """
        try:
            company = await self.get_company_by_slug(company_slug)
            meta_summary_doc = await self.db.meta_summaries.find_one({"company_id": company.id})
            if meta_summary_doc:
                return {
                    "meta_summary": meta_summary_doc.get("meta_summary"),
                    "document_signature": meta_summary_doc.get("document_signature"),
                    "created_at": meta_summary_doc.get("created_at"),
                    "updated_at": meta_summary_doc.get("updated_at"),
                }
            return None
        except Exception as e:
            logger.error(f"Error getting cached meta summary for {company_slug}: {e}")
            return None

    async def store_company_meta_summary(
        self, company_slug: str, meta_summary: DocumentAnalysis
    ) -> None:
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

    async def store_cached_meta_summary(
        self,
        company_slug: str,
        meta_summary: MetaSummary,
        document_signature: str,
    ) -> None:
        """
        Store cached meta-summary with document signature for cache invalidation.

        Args:
            company_slug: Company slug
            meta_summary: MetaSummary object to cache
            document_signature: Hash signature of all document content hashes
        """
        try:
            company = await self.get_company_by_slug(company_slug)
            now = datetime.now()

            meta_summary_doc = {
                "company_id": company.id,
                "company_slug": company_slug,
                "meta_summary": meta_summary.model_dump(),
                "document_signature": document_signature,
                "updated_at": now,
            }

            # Check if document exists to set created_at appropriately
            existing = await self.db.meta_summaries.find_one({"company_id": company.id})
            if existing:
                meta_summary_doc["created_at"] = existing.get("created_at", now)
            else:
                meta_summary_doc["created_at"] = now

            # Use upsert to either insert new or update existing
            await self.db.meta_summaries.update_one(
                {"company_id": company.id},
                {"$set": meta_summary_doc},
                upsert=True,
            )
            logger.info(
                f"Stored cached meta-summary for company {company_slug} "
                f"(signature: {document_signature[:16]}...)"
            )
        except Exception as e:
            logger.error(f"Error storing cached meta-summary for {company_slug}: {e}")
            raise e

    async def invalidate_meta_summary_cache(self, company_slug: str) -> bool:
        """
        Invalidate cached meta-summary for a company.

        Args:
            company_slug: Company slug to invalidate cache for

        Returns:
            True if cache was invalidated, False if no cache existed
        """
        try:
            company = await self.get_company_by_slug(company_slug)
            result = await self.db.meta_summaries.delete_one({"company_id": company.id})
            success = result.deleted_count > 0
            if success:
                logger.info(f"Invalidated meta-summary cache for company {company_slug}")
            return bool(success)
        except Exception as e:
            logger.error(f"Error invalidating meta-summary cache for {company_slug}: {e}")
            return False

    async def update_many(self, filter: dict[str, Any], update: dict[str, Any]) -> int:
        """Generic bulk update on companies, hides raw DB access from callers."""
        result = await self.db.companies.update_many(filter, update)
        return int(result.modified_count)

    async def ensure_visibility_default(self, default_tiers: list[UserTier]) -> int:
        """Set default visible_to_tiers where missing."""
        result = await self.db.companies.update_many(
            {"visible_to_tiers": {"$exists": False}},
            {"$set": {"visible_to_tiers": [t.value for t in default_tiers]}},
        )
        return int(result.modified_count)

    async def set_visibility_for_all(self, tiers: list[UserTier]) -> int:
        """Overwrite visible_to_tiers for all companies."""
        result = await self.db.companies.update_many(
            {},
            {"$set": {"visible_to_tiers": [t.value for t in tiers]}},
        )
        return int(result.modified_count)


# Global instance
company_service = CompanyService()
