from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from core.logging import get_logger
from src.services import migration_service

logger = get_logger(__name__)

router = APIRouter(prefix="/migration", tags=["migration"])


class MigrationRequest(BaseModel):
    dry_run: bool = True


class MigrationResponse(BaseModel):
    success: bool
    message: str
    data: dict | None = None
    error: str | None = None


@router.get("/summary", response_model=MigrationResponse)
async def get_migration_summary():
    """Get a summary of what would be migrated from local to production."""
    try:
        summary = await migration_service.get_summary()
        return MigrationResponse(
            success=True,
            message="Migration summary retrieved successfully",
            data=summary,
        )
    except Exception as e:
        logger.error(f"Error getting migration summary: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/dry-run", response_model=MigrationResponse)
async def run_dry_migration():
    """Run a dry run migration to see what would be migrated without actually migrating."""
    try:
        result = await migration_service.run_dry_run()

        return MigrationResponse(
            success=True,
            message="Dry run migration completed successfully",
            data=result,
        )
    except Exception as e:
        logger.error(f"Error in dry run migration: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/execute", response_model=MigrationResponse)
async def execute_migration(request: MigrationRequest):
    """Execute the actual migration from local to production."""
    try:
        result = await migration_service.execute(dry_run=request.dry_run)

        action = "dry run" if request.dry_run else "actual"
        return MigrationResponse(
            success=True,
            message=f"{action.capitalize()} migration completed successfully",
            data=result,
        )
    except Exception as e:
        logger.error(f"Error in migration execution: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/migrate-companies", response_model=MigrationResponse)
async def migrate_companies_only(request: MigrationRequest):
    """Migrate only companies from local to production."""
    try:
        result = await migration_service.migrate_companies(dry_run=request.dry_run)

        action = "dry run" if request.dry_run else "actual"
        return MigrationResponse(
            success=True,
            message=f"Companies {action} migration completed successfully",
            data=result,
        )
    except Exception as e:
        logger.error(f"Error in companies migration: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/migrate-documents", response_model=MigrationResponse)
async def migrate_documents_only(request: MigrationRequest):
    """Migrate only documents from local to production."""
    try:
        result = await migration_service.migrate_documents(dry_run=request.dry_run)

        action = "dry run" if request.dry_run else "actual"
        return MigrationResponse(
            success=True,
            message=f"Documents {action} migration completed successfully",
            data=result,
        )
    except Exception as e:
        logger.error(f"Error in documents migration: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/migrate-meta-summaries", response_model=MigrationResponse)
async def migrate_meta_summaries_only(request: MigrationRequest):
    """Migrate only meta summaries from local to production."""
    try:
        result = await migration_service.migrate_meta_summaries(dry_run=request.dry_run)

        action = "dry run" if request.dry_run else "actual"
        return MigrationResponse(
            success=True,
            message=f"Meta summaries {action} migration completed successfully",
            data=result,
        )
    except Exception as e:
        logger.error(f"Error in meta summaries migration: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/migrate-users-to-tier-system", response_model=MigrationResponse)
async def migrate_users_to_tier_system_only(request: MigrationRequest):
    """Migrate existing users to include tier and monthly_usage fields."""
    try:
        result = await migration_service.migrate_users_to_tier_system(dry_run=request.dry_run)

        action = "dry run" if request.dry_run else "actual"
        return MigrationResponse(
            success=True,
            message=f"User tier system {action} migration completed successfully",
            data=result,
        )
    except Exception as e:
        logger.error(f"Error in user tier migration: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e
