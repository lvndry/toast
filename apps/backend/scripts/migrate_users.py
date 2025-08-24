#!/usr/bin/env python3
"""
Standalone script to migrate existing users to include tier and monthly_usage fields.
This script can be run independently to update the database schema.
"""

import asyncio
import os
import sys
from datetime import datetime

# Add the src directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

from loguru import logger

from src.db import mongo
from src.user import UserTier


async def migrate_users_to_tier_system():
    """Migrate existing users to include tier and monthly_usage fields"""
    try:
        logger.info("Starting user tier migration...")

        # Get all users that don't have tier field
        users_without_tier = await mongo.db.users.find(
            {
                "$or": [
                    {"tier": {"$exists": False}},
                    {"monthly_usage": {"$exists": False}},
                ]
            }
        ).to_list(length=None)

        logger.info(f"Found {len(users_without_tier)} users to migrate")

        migrated_count = 0
        skipped_count = 0
        errors = []

        for user_doc in users_without_tier:
            try:
                user_id = user_doc.get("id")
                if not user_id:
                    skipped_count += 1
                    continue

                # Set default values for missing fields
                update_data = {}

                if "tier" not in user_doc:
                    update_data["tier"] = UserTier.FREE.value
                    logger.info(f"Setting tier to FREE for user {user_id}")

                if "monthly_usage" not in user_doc:
                    update_data["monthly_usage"] = {}
                    logger.info(f"Setting empty monthly_usage for user {user_id}")

                if update_data:
                    update_data["updated_at"] = datetime.now()
                    await mongo.db.users.update_one({"id": user_id}, {"$set": update_data})
                    migrated_count += 1
                else:
                    skipped_count += 1

            except Exception as e:
                error_msg = f"Error migrating user {user_doc.get('id', 'unknown')}: {str(e)}"
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
        await mongo.test_connection()

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
        mongo.close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(main())
