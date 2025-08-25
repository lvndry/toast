#!/usr/bin/env python3
"""
Migration script to add tier visibility to existing companies.
"""

import asyncio
import sys
from pathlib import Path

# Add the src directory to the Python path
sys.path.append(str(Path(__file__).parent.parent / "src"))

from src.services.company_service import company_service
from src.user import UserTier


async def migrate_company_tiers() -> None:
    """Add tier visibility to existing companies."""
    print("Starting company tier migration...")

    # Make ALL companies accessible to EVERY tier
    modified = await company_service.set_visibility_for_all(
        [UserTier.FREE, UserTier.BUSINESS, UserTier.ENTERPRISE]
    )

    print(f"✓ Updated {modified} companies to be accessible to all tiers")
    print("Migration completed successfully!")


if __name__ == "__main__":
    asyncio.run(migrate_company_tiers())
