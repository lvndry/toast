#!/usr/bin/env python3
"""
Test script to demonstrate the company tier population functionality.
This script shows how to use the populate_company_tiers.py script.
"""

import asyncio
import sys
from pathlib import Path

# Add the src directory to the Python path
sys.path.append(str(Path(__file__).parent.parent / "src"))

from src.services.company_service import company_service
from src.user import UserTier


async def test_tier_population() -> None:
    """Test the tier population functionality."""
    print("Testing Company Tier Population")
    print("=" * 40)

    try:
        # Test 1: Show current state
        print("\n1. Current company tier visibility:")
        all_companies = await company_service.get_all_companies()
        print(f"   Total companies: {len(all_companies)}")

        for company in all_companies[:5]:  # Show first 5 companies
            tiers = [tier.value for tier in company.visible_to_tiers]
            print(f"   {company.name}: {tiers}")

        if len(all_companies) > 5:
            print(f"   ... and {len(all_companies) - 5} more companies")

        # Test 2: Test tier filtering
        print("\n2. Testing tier filtering:")

        free_companies = await company_service.get_companies_by_tier(UserTier.FREE)
        business_companies = await company_service.get_companies_by_tier(UserTier.BUSINESS)
        enterprise_companies = await company_service.get_companies_by_tier(UserTier.ENTERPRISE)

        print(f"   Companies visible to FREE tier: {len(free_companies)}")
        print(f"   Companies visible to BUSINESS tier: {len(business_companies)}")
        print(f"   Companies visible to ENTERPRISE tier: {len(enterprise_companies)}")

        # Test 3: Test default visibility
        print("\n3. Testing default visibility:")
        modified = await company_service.ensure_visibility_default(
            [UserTier.FREE, UserTier.BUSINESS, UserTier.ENTERPRISE]
        )
        print(f"   Companies updated with default visibility: {modified}")

        # Test 4: Test bulk update
        print("\n4. Testing bulk update:")
        modified = await company_service.set_visibility_for_all(
            [UserTier.FREE, UserTier.BUSINESS, UserTier.ENTERPRISE]
        )
        print(f"   Companies updated to all tiers: {modified}")

        print("\n✓ All tests completed successfully!")

    except Exception as e:
        print(f"\n✗ Test failed: {e}")
        raise


async def main() -> None:
    """Main function to run the test."""
    try:
        await test_tier_population()
    except Exception as e:
        print(f"Test failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
