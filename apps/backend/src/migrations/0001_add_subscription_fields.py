"""Database migration to add subscription fields to existing users."""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

# Add parent directory to path to import from src
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.database import get_db
from src.core.logging import get_logger

logger = get_logger(__name__)


async def migrate_add_subscription_fields() -> None:
    """Add subscription fields to all existing users."""
    try:
        async with get_db() as db:
            # Define new fields with default values
            new_fields = {
                "paddle_customer_id": None,
                "paddle_subscription_id": None,
                "subscription_status": None,
                "subscription_started_at": None,
                "subscription_canceled_at": None,
                "subscription_current_period_end": None,
            }

            # Update all users
            result = await db.users.update_many(
                {},  # Empty filter = all documents
                {"$set": new_fields},
            )

            logger.info(
                f"Migration complete: Added subscription fields to {result.modified_count} users"
            )

    except Exception as e:
        logger.error(f"Migration failed: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(migrate_add_subscription_fields())
