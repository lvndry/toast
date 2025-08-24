#!/usr/bin/env python3
"""
Test script to verify logo update functionality.

This script will:
1. Test database connection
2. Test fetching a few companies
3. Test logo detection for one company
4. Verify the update process works
"""

import asyncio
import os
import sys
from urllib.parse import urlparse

import aiohttp

from core.logging import get_logger
from src.services.company_service import company_service

logger = get_logger(__name__)

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


async def test_database_connection():
    """Test database connection."""
    try:
        await company_service.test_connection()
        logger.info("✅ Database connection successful")
        return True
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        return False


async def test_fetch_companies():
    """Test fetching companies from database."""
    try:
        companies = await company_service.get_all_companies()
        # Limit to 5 for testing
        test_companies = companies[:5]
        logger.info(f"✅ Successfully fetched {len(test_companies)} companies")

        for company in test_companies:
            logger.info(f"  - {company.name} (ID: {company.id}, Logo: {company.logo or 'None'})")

        return test_companies
    except Exception as e:
        logger.error(f"❌ Failed to fetch companies: {e}")
        return []


async def test_logo_detection(company):
    """Test logo detection for a single company."""
    if not company.domains:
        logger.warning(f"⚠️  Company {company.name} has no domains")
        return None

    async with aiohttp.ClientSession() as session:
        domain = company.domains[0].strip().lower()
        if domain.startswith("http"):
            domain = urlparse(domain).netloc

        # Test a few common logo paths
        logo_paths = ["/logo.png", "/favicon.ico", "/images/logo.png"]

        for path in logo_paths:
            try:
                logo_url = f"https://{domain}{path}"
                async with session.head(logo_url, timeout=5) as response:
                    if response.status == 200:
                        logger.info(f"✅ Found logo for {company.name}: {logo_url}")
                        return logo_url
            except Exception:
                continue

        logger.warning(f"⚠️  No logo found for {company.name}")
        return None


async def test_logo_update(company, logo_url: str):
    """Test updating a company's logo."""
    try:
        success = await company_service.update_company_logo(company.id, logo_url)
        if success:
            logger.info(f"✅ Successfully updated logo for {company.name}")
            return True
        else:
            logger.warning(f"⚠️  No changes made for {company.name}")
            return False
    except Exception as e:
        logger.error(f"❌ Failed to update logo for {company.name}: {e}")
        return False


async def main():
    """Run all tests."""
    logger.info("🧪 Starting logo script tests...")

    # Test 1: Database connection
    if not await test_database_connection():
        logger.error("❌ Database connection test failed. Exiting.")
        return

    # Test 2: Fetch companies
    companies = await test_fetch_companies()
    if not companies:
        logger.error("❌ Company fetch test failed. Exiting.")
        return

    # Test 3: Logo detection for first company
    test_company = companies[0]
    logger.info(f"🔍 Testing logo detection for: {test_company.name}")

    logo_url = await test_logo_detection(test_company)

    # Test 4: Logo update (if logo found)
    if logo_url:
        success = await test_logo_update(test_company, logo_url)
        if success:
            logger.info("✅ Logo update test successful")
        else:
            logger.error("❌ Logo update test failed")
    else:
        logger.info("ℹ️  Skipping logo update test (no logo found)")

    logger.info("🎉 All tests completed!")


if __name__ == "__main__":
    # Configure logging
    logger.remove()
    logger.add(
        sys.stdout,
        format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <level>{message}</level>",
        level="INFO",
    )

    # Run the tests
    asyncio.run(main())
