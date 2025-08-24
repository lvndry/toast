#!/usr/bin/env python3
"""
Test script for the user tier and usage tracking system.
This script tests the core functionality of the usage service.
"""

# ruff: noqa: E712  # Allow explicit boolean comparisons in tests for clarity
import asyncio
import os
import sys
from datetime import datetime

from core.logging import get_logger
from src.services.usage_service import UsageService
from src.services.user_service import user_service
from src.user import User, UserTier

logger = get_logger(__name__)

# Add the src directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))


async def test_usage_service():
    """Test the usage service functionality"""
    logger.info("Starting usage service tests...")

    # Test user ID
    test_user_id = "test_user_123"

    try:
        # Clean up any existing test user
        await user_service.delete_user(test_user_id)

        # Create a test user
        test_user = User(id=test_user_id, email="test@example.com", tier=UserTier.FREE)
        await user_service.upsert_user(test_user)

        logger.info("Created test user")

        # Test 1: Check initial usage
        allowed, usage_info = await UsageService.check_usage_limit(test_user_id)
        logger.info(f"Initial usage check - Allowed: {allowed}, Usage: {usage_info}")
        assert allowed == True, "New user should be allowed"
        assert usage_info["used"] == 0, "New user should have 0 usage"
        assert usage_info["remaining"] == 1000, "Free tier should have 1000 remaining"

        # Test 2: Increment usage
        success = await UsageService.increment_usage(test_user_id, "meta_summary")
        logger.info(f"First usage increment - Success: {success}")
        assert success == True, "First usage increment should succeed"

        # Test 3: Check usage after increment
        allowed, usage_info = await UsageService.check_usage_limit(test_user_id)
        logger.info(f"Usage after increment - Allowed: {allowed}, Usage: {usage_info}")
        assert usage_info["used"] == 1, "Usage should be 1 after increment"
        assert usage_info["remaining"] == 999, "Should have 999 remaining"

        # Test 4: Get usage summary
        summary = await UsageService.get_usage_summary(test_user_id)
        logger.info(f"Usage summary: {summary}")
        assert summary["usage"]["used"] == 1, "Summary should show 1 usage"
        assert summary["tier"] == "free", "Should show free tier"

        # Test 5: Use up all free tier requests (simplified for testing)
        for i in range(5):  # Use 5 more requests for testing
            success = await UsageService.increment_usage(test_user_id, "meta_summary")
            logger.info(f"Usage increment {i + 2} - Success: {success}")
            assert success == True, f"Usage increment {i + 2} should succeed"

        # Test 6: Check usage after multiple increments
        allowed, usage_info = await UsageService.check_usage_limit(test_user_id)
        logger.info(f"Usage after multiple increments - Allowed: {allowed}, Usage: {usage_info}")
        assert usage_info["used"] == 6, "Should have used 6 requests"
        assert usage_info["remaining"] == 994, "Should have 994 remaining"

        # Test 7: Upgrade to business tier
        test_user.tier = UserTier.BUSINESS
        test_user.updated_at = datetime.now()
        await user_service.upsert_user(test_user)

        # Test 8: Check usage after upgrade
        allowed, usage_info = await UsageService.check_usage_limit(test_user_id)
        logger.info(f"Usage after upgrade - Allowed: {allowed}, Usage: {usage_info}")
        assert allowed == True, "Should be allowed after upgrade"
        assert usage_info["limit"] == 10000, "Business tier should have 10000 limit"
        assert usage_info["remaining"] == 9994, "Should have 9994 remaining (10000 - 6 used)"

        # Test 9: Use one more request after upgrade
        success = await UsageService.increment_usage(test_user_id, "meta_summary")
        logger.info(f"Usage after upgrade - Success: {success}")
        assert success == True, "Should allow usage after upgrade"

        logger.info("All usage service tests passed! ✅")

    except Exception as e:
        logger.error(f"Test failed: {e}")
        raise e

    finally:
        # Clean up test user
        await user_service.delete_user(test_user_id)
        logger.info("Cleaned up test user")


async def test_monthly_usage_format():
    """Test that monthly usage is stored in correct format"""
    logger.info("Testing monthly usage format...")

    test_user_id = "test_format_user"

    try:
        # Clean up any existing test user
        await user_service.delete_user(test_user_id)

        # Create test user
        test_user = User(id=test_user_id, email="format@example.com", tier=UserTier.FREE)
        await user_service.upsert_user(test_user)

        # Make some requests
        for _i in range(3):
            await UsageService.increment_usage(test_user_id, "meta_summary")

        # Check the stored format
        user = await user_service.get_user_by_id(test_user_id)
        monthly_usage = user.monthly_usage if user else {}

        current_month = UsageService.get_current_month_key()
        logger.info(f"Monthly usage format: {monthly_usage}")

        assert current_month in monthly_usage, f"Should have entry for {current_month}"
        assert monthly_usage[current_month] == 3, f"Should have 3 requests for {current_month}"

        logger.info("Monthly usage format test passed! ✅")

    except Exception as e:
        logger.error(f"Monthly usage format test failed: {e}")
        raise e

    finally:
        # Clean up
        await user_service.delete_user(test_user_id)


async def main():
    """Run all tests"""
    try:
        # Test database connection
        await user_service.test_connection()

        # Run tests
        await test_usage_service()
        await test_monthly_usage_format()

        print("\n🎉 All tests passed successfully!")

    except Exception as e:
        logger.error(f"Tests failed: {e}")
        sys.exit(1)

    finally:
        user_service.close_connection()


if __name__ == "__main__":
    asyncio.run(main())
