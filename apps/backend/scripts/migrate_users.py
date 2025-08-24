#!/usr/bin/env python3
"""
Standalone script to migrate existing users to include tier and monthly_usage fields.
This script can be run independently to update the database schema.
"""

import asyncio
import os
import sys
from datetime import datetime

from core.logging import get_logger
from src.services.user_service import user_service
from src.user import UserTier

# Add the src directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

logger = get_logger(__name__)


async def migrate_users_to_tier_system():
    """Migrate existing users to include tier and monthly_usage fields"""
    try:
        logger.info("Starting user tier migration...")

        # Get all users
        all_users = await user_service.get_all_users()

        # Filter users that don't have tier or monthly_usage fields
        users_to_migrate = []
        for user in all_users:
            if not hasattr(user, "tier") or not hasattr(user, "monthly_usage"):
                users_to_migrate.append(user)

        logger.info(f"Found {len(users_to_migrate)} users to migrate")

        migrated_count = 0
        skipped_count = 0
        errors = []

        for user in users_to_migrate:
            try:
                user_id = user.id
                if not user_id:
                    skipped_count += 1
                    continue

                # Set default values for missing fields
                needs_update = False

                if not hasattr(user, "tier") or user.tier is None:
                    user.tier = UserTier.FREE
                    logger.info(f"Setting tier to FREE for user {user_id}")
                    needs_update = True

                if not hasattr(user, "monthly_usage") or user.monthly_usage is None:
                    user.monthly_usage = {}
                    logger.info(f"Setting empty monthly_usage for user {user_id}")
                    needs_update = True

                if needs_update:
                    user.updated_at = datetime.now()
                    await user_service.upsert_user(user)
                    migrated_count += 1
                else:
                    skipped_count += 1

            except Exception as e:
                error_msg = f"Error migrating user {user.id if user else 'unknown'}: {str(e)}"
                errors.append(error_msg)
                logger.error(error_msg)

        logger.info("User tier migration completed successfully")
        logger.info(f"Migrated: {migrated_count}, Skipped: {skipped_count}, Errors: {len(errors)}")

        if errors:
            logger.warning("Migration completed with errors:")
            for error in errors:
                logger.warning(f"  - {error}")

        return {
            "migrated": migrated_count,
            "skipped": skipped_count,
            "errors": errors,
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        logger.error(f"Error during user tier migration: {e}")
        raise e


async def main():
    """Main function to run the migration"""
    try:
        # Test database connection
        await user_service.test_connection()

        # Run the migration
        result = await migrate_users_to_tier_system()

        print("\nMigration completed successfully!")
        print(f"Migrated users: {result['migrated']}")
        print(f"Skipped users: {result['skipped']}")
        print(f"Errors: {len(result['errors'])}")
        print(f"Timestamp: {result['timestamp']}")

    except Exception as e:
        logger.error(f"Migration failed: {e}")
        sys.exit(1)
    finally:
        user_service.close_connection()


if __name__ == "__main__":
    asyncio.run(main())
