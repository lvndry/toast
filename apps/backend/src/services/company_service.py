"""Company service for business logic operations.

This service coordinates business logic and delegates data access
to the CompanyRepository. It no longer owns database connections
and instead accepts database instances as parameters.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from motor.core import AgnosticDatabase

from src.core.logging import get_logger
from src.models.company import Company
from src.models.document import (
    CompanyAnalysis,
    CompanyDeepAnalysis,
    CompanyOverview,
    DocumentSummary,
    MetaSummary,
)
from src.repositories.company_repository import CompanyRepository
from src.repositories.document_repository import DocumentRepository

logger = get_logger(__name__)


class CompanyService:
    """Service for company-related business logic.

    This service coordinates business logic and uses repositories for
    data access. It doesn't own database connections - those are passed
    via parameters from the context manager.
    """

    def __init__(
        self,
        company_repo: CompanyRepository,
        document_repo: DocumentRepository,
    ) -> None:
        """Initialize CompanyService with repository dependencies.

        Args:
            company_repo: Repository for company data access
            document_repo: Repository for document data access
        """
        self._company_repo: CompanyRepository = company_repo
        self._document_repo: DocumentRepository = document_repo

    # ============================================================================
    # Company Operations
    # ============================================================================

    async def get_company_by_slug(self, db: AgnosticDatabase, slug: str) -> Company | None:
        """Get a company by its slug.

        Args:
            db: Database instance
            slug: Company slug

        Returns:
            Company or None if not found
        """
        return await self._company_repo.find_by_slug(db, slug)

    async def get_company_by_id(self, db: AgnosticDatabase, company_id: str) -> Company | None:
        """Get a company by its ID.

        Args:
            db: Database instance
            company_id: Company ID

        Returns:
            Company or None if not found
        """
        return await self._company_repo.find_by_id(db, company_id)

    async def get_all_companies(self, db: AgnosticDatabase) -> list[Company]:
        """Get all companies.

        Args:
            db: Database instance

        Returns:
            List of all companies
        """
        all_companies: list[Company] = await self._company_repo.find_all(db)
        return all_companies

    async def get_companies_with_documents(self, db: AgnosticDatabase) -> list[Company]:
        """Get all companies that have at least one document.

        Args:
            db: Database instance

        Returns:
            List of companies that have documents
        """
        companies: list[Company] = await self._company_repo.find_all_with_documents(db)
        return companies

    # ============================================================================
    # Meta-Summary Storage Operations
    # ============================================================================

    async def delete_meta_summary(self, db: AgnosticDatabase, slug: str) -> None:
        """Delete the stored meta-summary for a company.

        Args:
            db: Database instance
            slug: Company slug
        """
        await self._company_repo.delete_meta_summary(db, slug)

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
        meta_summary_data: dict[str, Any] | None = await self._company_repo.get_meta_summary(
            db, company_slug
        )
        return meta_summary_data

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
        await self._company_repo.save_meta_summary(
            db, company_slug, meta_summary, document_signature
        )

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
        deep_analysis_data: (
            dict[str, Any] | None
        ) = await self._company_repo.get_deep_analysis(db, company_slug)
        return deep_analysis_data

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
        await self._company_repo.save_deep_analysis(
            db, company_slug, deep_analysis, document_signature
        )

    # ============================================================================
    # Business Logic Methods (Level 1, 2, 3 Analysis)
    # ============================================================================

    async def get_company_overview(self, db: AgnosticDatabase, slug: str) -> CompanyOverview | None:
        """Get the Level 1 overview for a company.

        This is business logic that transforms cached data into a user-facing overview.

        Args:
            db: Database instance
            slug: Company slug

        Returns:
            CompanyOverview or None if not available
        """
        meta_summary_data = await self._company_repo.get_meta_summary(db, slug)
        if not meta_summary_data:
            return None

        meta_summary = MetaSummary(**meta_summary_data["meta_summary"])

        # Fetch company info (name, id)
        company = await self._company_repo.find_by_slug(db, slug)

        # Compute document counts and types
        document_counts = None
        document_types = None
        if company:
            document_counts = await self._company_repo.get_document_counts(db, company.id)
            document_types = await self._company_repo.get_document_types(db, company.id)

        # Extract updated_at from meta_summary_data if present
        updated_at = None
        if "updated_at" in meta_summary_data["meta_summary"]:
            try:
                updated_at = datetime.fromisoformat(meta_summary_data["meta_summary"]["updated_at"])
            except Exception:
                pass

        overview = self._transform_to_overview(meta_summary, slug, updated_at)

        # Override company name with real name when available
        if company:
            overview.company_name = company.name

        # Attach optional fields from meta_summary and computed values
        overview.keypoints = getattr(meta_summary, "keypoints", None)
        overview.document_counts = document_counts
        overview.document_types = document_types

        # Attach new structured fields for Overview redesign
        overview.data_collection_details = getattr(meta_summary, "data_collection_details", None)
        overview.third_party_details = getattr(meta_summary, "third_party_details", None)

        return overview

    async def get_company_analysis(self, db: AgnosticDatabase, slug: str) -> CompanyAnalysis | None:
        """Get the Level 2 full analysis for a company.

        Args:
            db: Database instance
            slug: Company slug

        Returns:
            CompanyAnalysis or None if not available
        """
        meta_summary_data = await self._company_repo.get_meta_summary(db, slug)
        if not meta_summary_data:
            return None
        meta_summary = MetaSummary(**meta_summary_data["meta_summary"])

        # Extract updated_at from meta_summary_data if present
        updated_at = None
        if "updated_at" in meta_summary_data["meta_summary"]:
            try:
                updated_at = datetime.fromisoformat(meta_summary_data["meta_summary"]["updated_at"])
            except Exception:
                pass

        overview = self._transform_to_overview(meta_summary, slug, updated_at)

        # Fetch documents
        company = await self._company_repo.find_by_slug(db, slug)
        documents: list[DocumentSummary] = []
        if company:
            docs = await self._document_repo.find_by_company_id(db, company.id)
            documents = [DocumentSummary.from_document(doc) for doc in docs]

        return CompanyAnalysis(
            overview=overview,
            detailed_scores=meta_summary.scores,
            compliance=None,  # TODO: Store compliance in DB or calculate it
            all_keypoints=meta_summary.keypoints,
            documents=documents,
        )

    async def get_company_documents(self, db: AgnosticDatabase, slug: str) -> list[DocumentSummary]:
        """Get the list of documents for a company.

        Args:
            db: Database instance
            slug: Company slug

        Returns:
            List of document summaries
        """
        company = await self._company_repo.find_by_slug(db, slug)
        if not company:
            return []

        docs = await self._document_repo.find_by_company_id(db, company.id)
        return [DocumentSummary.from_document(doc) for doc in docs]

    async def get_company_deep_analysis(
        self, db: AgnosticDatabase, slug: str
    ) -> CompanyDeepAnalysis | None:
        """Get the Level 3 deep analysis for a company.

        Args:
            db: Database instance
            slug: Company slug

        Returns:
            CompanyDeepAnalysis or None if not available
        """
        stored_data = await self._company_repo.get_deep_analysis(db, slug)
        if not stored_data:
            return None

        try:
            deep_analysis: CompanyDeepAnalysis = CompanyDeepAnalysis.model_validate(
                stored_data["deep_analysis"]
            )
            return deep_analysis
        except Exception as e:
            logger.error(f"Failed to parse deep analysis for {slug}: {e}")
            return None

    # ============================================================================
    # Helper Methods
    # ============================================================================

    def _transform_to_overview(
        self, meta: MetaSummary, slug: str, updated_at: datetime | None = None
    ) -> CompanyOverview:
        """Transform a MetaSummary into a CompanyOverview.

        This is pure business logic with no database access.

        Args:
            meta: MetaSummary object
            slug: Company slug
            updated_at: Last updated timestamp

        Returns:
            CompanyOverview object
        """
        return CompanyOverview(
            company_name=slug.capitalize(),  # Placeholder, ideally fetch from Company
            company_slug=slug,
            last_updated=updated_at if updated_at else datetime.now(),
            verdict=meta.verdict,
            risk_score=meta.risk_score,
            one_line_summary=meta.summary,
            data_collected=meta.data_collected,
            data_purposes=meta.data_purposes,
            your_rights=meta.your_rights,
            dangers=meta.dangers,
            benefits=meta.benefits,
            recommended_actions=meta.recommended_actions,
        )
