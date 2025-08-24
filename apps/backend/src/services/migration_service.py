from __future__ import annotations

from typing import Any

from src.core.logging import get_logger
from src.migration import MigrationManager

logger = get_logger(__name__)


async def get_summary() -> dict[str, Any]:
    """Get a summary of the migration process."""
    migration_manager = MigrationManager()
    await migration_manager.connect_databases()
    summary: dict[str, Any] = await migration_manager.get_migration_summary()
    await migration_manager.close_connections()
    return summary


async def run_dry_run() -> dict[str, Any]:
    """Run a dry run of the migration process."""
    migration_manager = MigrationManager()
    result: dict[str, Any] = await migration_manager.run_full_migration(dry_run=True)
    return result


async def execute(dry_run: bool) -> dict[str, Any] | None:
    """Execute the migration process."""
    migration_manager = MigrationManager()
    result: dict[str, Any] = await migration_manager.run_full_migration(dry_run=dry_run)
    return result


async def migrate_companies(dry_run: bool) -> dict[str, Any]:
    """Migrate companies."""
    migration_manager = MigrationManager()
    await migration_manager.connect_databases()
    result: dict[str, Any] = await migration_manager.migrate_companies(dry_run=dry_run)
    await migration_manager.close_connections()
    return result


async def migrate_documents(dry_run: bool) -> dict[str, Any]:
    """Migrate documents."""
    migration_manager = MigrationManager()
    await migration_manager.connect_databases()
    result: dict[str, Any] = await migration_manager.migrate_documents(dry_run=dry_run)
    await migration_manager.close_connections()
    return result


async def migrate_meta_summaries(dry_run: bool) -> dict[str, Any]:
    """Migrate meta summaries."""
    migration_manager = MigrationManager()
    await migration_manager.connect_databases()
    result: dict[str, Any] = await migration_manager.migrate_meta_summaries(dry_run=dry_run)
    await migration_manager.close_connections()
    return result


async def migrate_users_to_tier_system(dry_run: bool) -> dict[str, Any]:
    """Migrate existing users to include tier and monthly_usage fields"""
    migration_manager = MigrationManager()
    await migration_manager.connect_databases()
    result: dict[str, Any] = await migration_manager.migrate_users_to_tier_system(dry_run=dry_run)
    await migration_manager.close_connections()
    return result
