#!/usr/bin/env python3
"""
Simple script to update company logos using domain-based detection.

This script will:
1. Fetch all companies from the database
2. Try to find logos by checking common paths on company domains
3. Update the company records with logo URLs
4. Handle errors gracefully and provide logging
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


class SimpleLogoFetcher:
    """Fetches company logos using domain-based detection."""

    def __init__(self):
        self.session = None

    async def __aenter__(self):
        timeout = aiohttp.ClientTimeout(total=10)
        self.session = aiohttp.ClientSession(timeout=timeout)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def get_logo_from_domain(self, domain: str) -> str | None:
        """Try to find logo by checking common paths on the company's domain."""
        if not domain:
            return None

        # Clean domain
        clean_domain = domain.strip().lower()
        if clean_domain.startswith("http"):
            clean_domain = urlparse(clean_domain).netloc

        # Common logo paths to try
        logo_paths = [
            "/logo.png",
            "/logo.svg",
            "/favicon.ico",
            "/images/logo.png",
            "/assets/logo.png",
            "/static/logo.png",
            "/img/logo.png",
            "/logo/logo.png",
            "/brand/logo.png",
            "/assets/images/logo.png",
            "/static/images/logo.png",
        ]

        for path in logo_paths:
            try:
                logo_url = f"https://{clean_domain}{path}"
                async with self.session.head(logo_url) as response:
                    if response.status == 200:
                        logger.info(f"Found logo at {logo_url}")
                        return logo_url
            except Exception:
                continue

        return None

    async def find_best_logo(self, company) -> str | None:
        """Find the best available logo for a company."""
        if company.domains:
            for domain in company.domains:
                logo = await self.get_logo_from_domain(domain)
                if logo:
                    return logo

        logger.warning(f"No logo found for {company.name}")
        return None


async def main():
    """Main function to update all company logos."""
    logger.info("Starting simple company logo update process...")

    # Test database connection
    try:
        await company_service.test_connection()
        logger.info("Connected to database successfully")
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        return

    # Get all companies
    try:
        companies = await company_service.get_all_companies()
        logger.info(f"Found {len(companies)} companies to process")
    except Exception as e:
        logger.error(f"Failed to fetch companies: {e}")
        return

    # Process companies
    async with SimpleLogoFetcher() as fetcher:
        updated_count = 0
        error_count = 0
        skipped_count = 0

        for i, company in enumerate(companies, 1):
            logger.info(f"Processing {i}/{len(companies)}: {company.name}")

            # Skip if already has a logo
            if company.logo:
                logger.info(f"Skipping {company.name} - already has logo")
                skipped_count += 1
                continue

            # Skip if no domains
            if not company.domains:
                logger.warning(f"Skipping {company.name} - no domains available")
                error_count += 1
                continue

            try:
                # Find logo
                logo_url = await fetcher.find_best_logo(company)

                if logo_url:
                    # Update database
                    success = await company_service.update_company_logo(company.id, logo_url)
                    if success:
                        updated_count += 1
                    else:
                        error_count += 1
                else:
                    error_count += 1

                # Add small delay to avoid overwhelming servers
                await asyncio.sleep(1)

            except Exception as e:
                logger.error(f"Error processing {company.name}: {e}")
                error_count += 1

    # Summary
    logger.info("Logo update process completed!")
    logger.info(f"Successfully updated: {updated_count}")
    logger.info(f"Errors: {error_count}")
    logger.info(f"Skipped (already had logos): {skipped_count}")


if __name__ == "__main__":
    # Configure logging
    logger.remove()
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO",
    )

    # Run the script
    asyncio.run(main())
