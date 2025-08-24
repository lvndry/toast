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

# Add the src directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

from loguru import logger

from src.db import mongo
from src.services.usage_service import UsageService
from src.user import User, UserTier


async def test_usage_service():
    """Test the usage service functionality"""
    logger.info("Starting usage service tests...")

    # Test user ID
    test_user_id = "test_user_123"

    try:
        # Clean up any existing test user
        await mongo.db.users.delete_one({"id": test_user_id})

        # Create a test user
        test_user = User(id=test_user_id, email="test@example.com", tier=UserTier.FREE)
        await mongo.db.users.insert_one(test_user.model_dump(mode="json"))

        logger.info("Created test user")

        # Test 1: Check initial usage
        allowed, usage_info = await UsageService.check_usage_limit(test_user_id)
        logger.info(f"Initial usage check - Allowed: {allowed}, Usage: {usage_info}")
        assert allowed == True, "New user should be allowed"
        assert usage_info["used"] == 0, "New user should have 0 usage"
        assert usage_info["remaining"] == 5, "Free tier should have 5 remaining"

        # Test 2: Increment usage
        success = await UsageService.increment_usage(test_user_id, "meta_summary")
        logger.info(f"First usage increment - Success: {success}")
        assert success == True, "First usage increment should succeed"

        # Test 3: Check usage after increment
        allowed, usage_info = await UsageService.check_usage_limit(test_user_id)
        logger.info(f"Usage after increment - Allowed: {allowed}, Usage: {usage_info}")
        assert usage_info["used"] == 1, "Usage should be 1 after increment"
        assert usage_info["remaining"] == 4, "Should have 4 remaining"

        # Test 4: Get usage summary
        summary = await UsageService.get_usage_summary(test_user_id)
        logger.info(f"Usage summary: {summary}")
        assert summary["usage"]["used"] == 1, "Summary should show 1 usage"
        assert summary["tier"] == "free", "Should show free tier"

        # Test 5: Use up all free tier requests
        for i in range(4):  # Use remaining 4 requests
            success = await UsageService.increment_usage(test_user_id, "meta_summary")
            logger.info(f"Usage increment {i + 2} - Success: {success}")
            assert success == True, f"Usage increment {i + 2} should succeed"

        # Test 6: Try to exceed limit
        success = await UsageService.increment_usage(test_user_id, "meta_summary")
        logger.info(f"Exceed limit attempt - Success: {success}")
        assert success == False, "Should not allow exceeding limit"

        # Test 7: Check usage at limit
        allowed, usage_info = await UsageService.check_usage_limit(test_user_id)
        logger.info(f"Usage at limit - Allowed: {allowed}, Usage: {usage_info}")
        assert allowed == False, "Should not be allowed at limit"
        assert usage_info["used"] == 5, "Should have used all 5 requests"
        assert usage_info["remaining"] == 0, "Should have 0 remaining"

        # Test 8: Upgrade to business tier
        test_user.tier = UserTier.BUSINESS
        test_user.updated_at = datetime.now()
        await mongo.db.users.update_one(
            {"id": test_user_id}, {"$set": test_user.model_dump(mode="json")}
        )

        # Test 9: Check usage after upgrade
        allowed, usage_info = await UsageService.check_usage_limit(test_user_id)
        logger.info(f"Usage after upgrade - Allowed: {allowed}, Usage: {usage_info}")
        assert allowed == True, "Should be allowed after upgrade"
        assert usage_info["limit"] == 100, "Business tier should have 100 limit"
        assert usage_info["remaining"] == 95, "Should have 95 remaining (100 - 5 used)"

        # Test 10: Use one more request after upgrade
        success = await UsageService.increment_usage(test_user_id, "meta_summary")
        logger.info(f"Usage after upgrade - Success: {success}")
        assert success == True, "Should allow usage after upgrade"

        logger.info("All usage service tests passed! ✅")

    except Exception as e:
        logger.error(f"Test failed: {e}")
        raise e

    finally:
        # Clean up test user
        await mongo.db.users.delete_one({"id": test_user_id})
        logger.info("Cleaned up test user")


async def test_monthly_usage_format():
    """Test that monthly usage is stored in correct format"""
    logger.info("Testing monthly usage format...")

    test_user_id = "test_format_user"

    try:
        # Clean up any existing test user
        await mongo.db.users.delete_one({"id": test_user_id})

        # Create test user
        test_user = User(id=test_user_id, email="format@example.com", tier=UserTier.FREE)
        await mongo.db.users.insert_one(test_user.model_dump(mode="json"))

        # Make some requests
        for _i in range(3):
            await UsageService.increment_usage(test_user_id, "meta_summary")

        # Check the stored format
        user_doc = await mongo.db.users.find_one({"id": test_user_id})
        monthly_usage = user_doc.get("monthly_usage", {})

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
        await mongo.db.users.delete_one({"id": test_user_id})


async def main():
    """Run all tests"""
    try:
        # Test database connection
        await mongo.test_connection()

        # Run tests
        await test_usage_service()
        await test_monthly_usage_format()

        print("\n🎉 All tests passed successfully!")

    except Exception as e:
        logger.error(f"Tests failed: {e}")
        sys.exit(1)

    finally:
        mongo.close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(main())
