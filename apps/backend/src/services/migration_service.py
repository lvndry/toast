from src.migration import MigrationManager


async def get_summary():
    migration_manager = MigrationManager()
    await migration_manager.connect_databases()
    summary = await migration_manager.get_migration_summary()
    await migration_manager.close_connections()
    return summary


async def run_dry_run():
    migration_manager = MigrationManager()
    return await migration_manager.run_full_migration(dry_run=True)


async def execute(dry_run: bool):
    migration_manager = MigrationManager()
    return await migration_manager.run_full_migration(dry_run=dry_run)


async def migrate_companies(dry_run: bool):
    migration_manager = MigrationManager()
    await migration_manager.connect_databases()
    result = await migration_manager.migrate_companies(dry_run=dry_run)
    await migration_manager.close_connections()
    return result


async def migrate_documents(dry_run: bool):
    migration_manager = MigrationManager()
    await migration_manager.connect_databases()
    result = await migration_manager.migrate_documents(dry_run=dry_run)
    await migration_manager.close_connections()
    return result


async def migrate_meta_summaries(dry_run: bool):
    migration_manager = MigrationManager()
    await migration_manager.connect_databases()
    result = await migration_manager.migrate_meta_summaries(dry_run=dry_run)
    await migration_manager.close_connections()
    return result
