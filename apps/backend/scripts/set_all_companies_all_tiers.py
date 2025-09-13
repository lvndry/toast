#!/usr/bin/env python3
"""
Simple script to set all companies to be accessible to all user tiers.
"""

import asyncio
import sys
from pathlib import Path

# Add the src directory to the Python path
sys.path.append(str(Path(__file__).parent.parent / "src"))

from src.services.company_service import company_service
from src.user import UserTier


async def set_all_companies_all_tiers() -> None:
    """Set all companies to be accessible to all tiers."""
    print("Setting all companies to be accessible to all tiers...")

    # Use the existing method to set all companies to all tiers
    modified = await company_service.set_visibility_for_all(
        [UserTier.FREE, UserTier.BUSINESS, UserTier.ENTERPRISE]
    )

    print(f"✓ Updated {modified} companies to be accessible to all tiers")
    print("Done!")


if __name__ == "__main__":
    asyncio.run(set_all_companies_all_tiers())
