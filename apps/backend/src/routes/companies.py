"""Company routes using Repository pattern with context manager."""

from fastapi import APIRouter, HTTPException, Query

from src.core.database import get_db
from src.core.logging import get_logger
from src.models.company import Company
from src.models.document import (
    CompanyAnalysis,
    CompanyDeepAnalysis,
    CompanyOverview,
    DocumentSummary,
)
from src.services.service_factory import create_company_service, create_services
from src.summarizer import generate_company_deep_analysis, generate_company_meta_summary

logger = get_logger(__name__)

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("", response_model=list[Company])
async def get_all_companies(
    include_all: bool = Query(
        default=False,
        description="If true, returns all companies. If false (default), returns only companies with at least one document.",
    ),
) -> list[Company]:
    """Get a list of companies.

    By default, only returns companies that have at least one document.
    Set include_all=true to get all companies regardless of document count.
    """
    async with get_db() as db:
        service = create_company_service()
        if include_all:
            companies = await service.get_all_companies(db)
        else:
            companies = await service.get_companies_with_documents(db)
        return companies  # type: ignore


@router.get("/{slug}/overview", response_model=CompanyOverview)
async def get_company_overview(slug: str) -> CompanyOverview:
    """Get a quick decision-making overview for a company (Level 1).
    Generates the overview on-the-fly if it doesn't exist yet.
    """
    try:
        async with get_db() as db:
            service = create_company_service()

            # First check if company exists
            company = await service.get_company_by_slug(db, slug)
            if not company:
                raise HTTPException(status_code=404, detail="Company not found")

            # Try to get existing overview
            overview = await service.get_company_overview(db, slug)
            if overview:
                return overview

            # Overview doesn't exist - generate it JIT
            logger.info(f"Overview not found for {slug}, generating on-the-fly...")
            try:
                company_svc, doc_svc = create_services()
                # Generate meta-summary (will raise exception on failure)
                await generate_company_meta_summary(
                    db, slug, company_svc=company_svc, document_svc=doc_svc
                )

                # After successful generation, retrieve the overview
                overview = await service.get_company_overview(db, slug)
                if overview:
                    return overview
                else:
                    # This shouldn't happen, but handle it gracefully
                    logger.error(
                        f"Failed to retrieve overview after generation for {slug}. "
                        f"Meta-summary was generated but overview transformation failed."
                    )
                    raise HTTPException(
                        status_code=500,
                        detail="Failed to generate company overview. The overview could not be created from the generated summary.",
                    )
            except HTTPException:
                # Re-raise HTTP exceptions as-is
                raise
            except Exception as e:
                # Log the full error with context
                logger.error(
                    f"Error generating overview for {slug}: {str(e)}",
                    exc_info=True,
                )
                # Return the actual error message to the client so they know what went wrong
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to generate company overview: {str(e)}",
                ) from e
    except HTTPException:
        # Re-raise HTTP exceptions as-is (they already have proper responses)
        raise
    except BaseException as e:
        logger.error(
            f"Unexpected error in get_company_overview for {slug}: {str(e)}",
            exc_info=True,
        )

        error_detail = (
            f"An unexpected error occurred while fetching company overview: {str(e)}"
            if str(e)
            else "An unexpected error occurred while fetching company overview."
        )
        raise HTTPException(status_code=500, detail=error_detail) from None


@router.get("/{slug}/analysis", response_model=CompanyAnalysis)
async def get_company_analysis(slug: str) -> CompanyAnalysis:
    """Get a comprehensive analysis for a company (Level 2).
    Generates the analysis on-the-fly if it doesn't exist yet.
    """
    async with get_db() as db:
        service = create_company_service()

        # First check if company exists
        company = await service.get_company_by_slug(db, slug)
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        # Try to get existing analysis
        analysis = await service.get_company_analysis(db, slug)
        if analysis:
            return analysis

        # Analysis doesn't exist - generate meta_summary JIT (which creates both overview and analysis)
        logger.info(f"Analysis not found for {slug}, generating on-the-fly...")
        try:
            company_svc, doc_svc = create_services()
            await generate_company_meta_summary(
                db, slug, company_svc=company_svc, document_svc=doc_svc
            )
            # Now get the analysis (it should exist after generation)
            analysis = await service.get_company_analysis(db, slug)
            if analysis:
                return analysis
            else:
                # This shouldn't happen, but handle it gracefully
                logger.error(f"Failed to retrieve analysis after generation for {slug}")
                raise HTTPException(
                    status_code=500,
                    detail="Failed to generate company analysis. Please try again later.",
                )
        except HTTPException:
            # Re-raise HTTP exceptions as-is
            raise
        except Exception as e:
            logger.error(f"Error generating analysis for {slug}: {e}")
            raise HTTPException(
                status_code=404,
                detail="Company analysis not available. The company exists but has no documents to analyze yet.",
            ) from e


@router.get("/{slug}/documents", response_model=list[DocumentSummary])
async def get_company_documents(slug: str) -> list[DocumentSummary]:
    """Get a list of analyzed documents for a company."""
    async with get_db() as db:
        service = create_company_service()
        documents = await service.get_company_documents(db, slug)
        return documents  # type: ignore


@router.get("/{slug}/deep-analysis", response_model=CompanyDeepAnalysis)
async def get_company_deep_analysis_route(slug: str) -> CompanyDeepAnalysis:
    """Get deep analysis for a company (Level 3).
    Generates the deep analysis on-the-fly if it doesn't exist yet.
    """
    async with get_db() as db:
        service = create_company_service()

        # First check if company exists
        company = await service.get_company_by_slug(db, slug)
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        # Try to get existing deep analysis
        deep_analysis = await service.get_company_deep_analysis(db, slug)
        if deep_analysis:
            return deep_analysis

        # Deep analysis doesn't exist - generate it JIT
        logger.info(f"Deep analysis not found for {slug}, generating on-the-fly...")
        try:
            company_svc, doc_svc = create_services()
            deep_analysis = await generate_company_deep_analysis(
                db, slug, company_svc=company_svc, document_svc=doc_svc
            )
            return deep_analysis
        except HTTPException:
            # Re-raise HTTP exceptions as-is
            raise
        except Exception as e:
            logger.error(f"Error generating deep analysis for {slug}: {e}")
            raise HTTPException(
                status_code=500,
                detail="Failed to generate company deep analysis. Please try again later.",
            ) from e


@router.get("/{slug}", response_model=Company)
async def get_company_by_slug(slug: str) -> Company:
    """Get a company by its slug."""
    async with get_db() as db:
        service = create_company_service()
        company = await service.get_company_by_slug(db, slug)
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        return company
