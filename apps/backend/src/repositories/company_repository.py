"""Company repository for data access operations."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from motor.core import AgnosticDatabase

from src.core.logging import get_logger
from src.models.company import Company
from src.models.document import CompanyDeepAnalysis, MetaSummary
from src.repositories.base_repository import BaseRepository

logger = get_logger(__name__)


class CompanyRepository(BaseRepository):
    """Repository for company-related database operations.

    Handles all database access for companies, meta-summaries, and deep analyses.
    Methods are stateless and accept database instance as parameter.
    """

    # ============================================================================
    # Company CRUD Operations
    # ============================================================================

    async def find_by_slug(self, db: AgnosticDatabase, slug: str) -> Company | None:
        """Get a company by its slug.

        Args:
            db: Database instance
            slug: Company slug

        Returns:
            Company or None if not found
        """
        company_data = await db.companies.find_one({"slug": slug})
        if not company_data:
            return None
        return Company(**company_data)

    async def find_by_id(self, db: AgnosticDatabase, company_id: str) -> Company | None:
        """Get a company by its ID.

        Args:
            db: Database instance
            company_id: Company ID

        Returns:
            Company or None if not found
        """
        company_data = await db.companies.find_one({"id": company_id})
        if not company_data:
            return None
        return Company(**company_data)

    async def find_all(self, db: AgnosticDatabase) -> list[Company]:
        """Get all companies.

        Args:
            db: Database instance

        Returns:
            List of all companies
        """
        companies_data: list[dict[str, Any]] = await db.companies.find().to_list(length=None)
        return [Company(**company_data) for company_data in companies_data]

    async def find_all_with_documents(self, db: AgnosticDatabase) -> list[Company]:
        """Get all companies that have at least one document.

        Args:
            db: Database instance

        Returns:
            List of companies that have documents
        """
        # Use aggregation to find distinct company_ids from documents
        pipeline = [
            {"$group": {"_id": "$company_id"}},
            {"$project": {"_id": 0, "company_id": "$_id"}},
        ]
        company_ids_data: list[dict[str, Any]] = await db.documents.aggregate(pipeline).to_list(
            length=None
        )
        company_ids = [item["company_id"] for item in company_ids_data]

        if not company_ids:
            return []

        # Fetch companies with those IDs
        companies_data: list[dict[str, Any]] = await db.companies.find(
            {"id": {"$in": company_ids}}
        ).to_list(length=None)
        return [Company(**company_data) for company_data in companies_data]

    # ============================================================================
    # Meta-Summary Storage Operations
    # ============================================================================

    async def get_meta_summary(
        self, db: AgnosticDatabase, company_slug: str
    ) -> dict[str, Any] | None:
        """Get the stored meta-summary data for a company.

        Args:
            db: Database instance
            company_slug: Company slug

        Returns:
            Dictionary with 'meta_summary' and 'document_signature' keys, or None
        """
        stored_data = await db.meta_summaries.find_one({"company_slug": company_slug})
        if not stored_data:
            return None

        return {
            "meta_summary": stored_data,
            "document_signature": stored_data.get("document_signature"),
        }

    async def save_meta_summary(
        self,
        db: AgnosticDatabase,
        company_slug: str,
        meta_summary: MetaSummary,
        document_signature: str,
    ) -> None:
        """Save the meta-summary to the database with document signature.

        Args:
            db: Database instance
            company_slug: Company slug
            meta_summary: MetaSummary object to save
            document_signature: Hash signature of all document contents
        """
        summary_data = meta_summary.model_dump()
        summary_data["company_slug"] = company_slug
        summary_data["document_signature"] = document_signature
        summary_data["updated_at"] = datetime.now().isoformat()

        await db.meta_summaries.update_one(
            {"company_slug": company_slug},
            {"$set": summary_data},
            upsert=True,
        )
        logger.debug(
            f"Saved meta-summary for {company_slug} with signature {document_signature[:16]}..."
        )

    async def delete_meta_summary(self, db: AgnosticDatabase, company_slug: str) -> None:
        """Delete the stored meta-summary for a company.

        Args:
            db: Database instance
            company_slug: Company slug
        """
        await db.meta_summaries.delete_one({"company_slug": company_slug})
        logger.debug(f"Deleted meta-summary for {company_slug}")

    # ============================================================================
    # Deep Analysis Storage Operations
    # ============================================================================

    async def get_deep_analysis(
        self, db: AgnosticDatabase, company_slug: str
    ) -> dict[str, Any] | None:
        """Get the stored deep analysis data for a company.

        Args:
            db: Database instance
            company_slug: Company slug

        Returns:
            Dictionary with 'deep_analysis' and 'document_signature' keys, or None
        """
        stored_data = await db.deep_analyses.find_one({"company_slug": company_slug})
        if not stored_data:
            return None

        return {
            "deep_analysis": stored_data,
            "document_signature": stored_data.get("document_signature"),
        }

    async def save_deep_analysis(
        self,
        db: AgnosticDatabase,
        company_slug: str,
        deep_analysis: CompanyDeepAnalysis,
        document_signature: str,
    ) -> None:
        """Save the deep analysis to the database with document signature.

        Args:
            db: Database instance
            company_slug: Company slug
            deep_analysis: CompanyDeepAnalysis object to save
            document_signature: Hash signature of all document contents
        """
        analysis_data = deep_analysis.model_dump()
        analysis_data["company_slug"] = company_slug
        analysis_data["document_signature"] = document_signature
        analysis_data["updated_at"] = datetime.now().isoformat()

        await db.deep_analyses.update_one(
            {"company_slug": company_slug},
            {"$set": analysis_data},
            upsert=True,
        )
        logger.debug(
            f"Saved deep analysis for {company_slug} with signature {document_signature[:16]}..."
        )

    # ============================================================================
    # Document Statistics
    # ============================================================================

    async def get_document_counts(
        self, db: AgnosticDatabase, company_id: str
    ) -> dict[str, int] | None:
        """Get document counts for a company.

        Args:
            db: Database instance
            company_id: Company ID

        Returns:
            Dictionary with total, analyzed, and pending counts, or None on error
        """
        try:
            total = await db.documents.count_documents({"company_id": company_id})
            analyzed = await db.documents.count_documents(
                {"company_id": company_id, "analysis": {"$exists": True}}
            )
            pending = max(0, total - analyzed)
            return {
                "total": int(total),
                "analyzed": int(analyzed),
                "pending": int(pending),
            }
        except Exception:
            return None

    async def get_document_types(
        self, db: AgnosticDatabase, company_id: str
    ) -> dict[str, int] | None:
        """Get document type counts for a company.

        Args:
            db: Database instance
            company_id: Company ID

        Returns:
            Dictionary mapping document types to counts, or None on error
        """
        try:
            pipeline = [
                {"$match": {"company_id": company_id}},
                {"$group": {"_id": "$doc_type", "count": {"$sum": 1}}},
            ]
            agg: list[dict[str, Any]] = await db.documents.aggregate(pipeline).to_list(length=None)
            return {item["_id"]: int(item["count"]) for item in agg} if agg else None
        except Exception:
            return None
