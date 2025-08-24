#!/usr/bin/env python3
"""
Advanced script to update company logos using multiple sources.

This script will:
1. Fetch all companies from the database
2. Try to find logos from multiple sources:
   - Clearbit Logo API (requires CLEARBIT_API_KEY)
   - Google Custom Search API (requires GOOGLE_API_KEY and GOOGLE_CSE_ID)
   - Domain-based detection
3. Update the company records with logo URLs
4. Handle errors gracefully and provide detailed logging
"""

import asyncio
import os
import sys
from typing import Any
from urllib.parse import urlparse

import aiohttp
from core.logging import get_logger

from src.company import Company
from src.services.company_service import company_service

logger = get_logger(__name__)


# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class LogoFetcher:
    """Fetches company logos from various sources."""

    def __init__(self) -> None:
        self._session: aiohttp.ClientSession | None = None

    @property
    def session(self) -> aiohttp.ClientSession:
        if self._session is None:
            raise RuntimeError("Session not initialized")
        return self._session

    async def __aenter__(self) -> "LogoFetcher":
        self._session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        if self._session:
            await self._session.close()

    async def get_logo_from_clearbit(self, domain: str) -> str | None:
        """Fetch logo from Clearbit Logo API."""
        try:
            url = f"https://logo.clearbit.com/{domain}"
            async with self.session.head(url, timeout=10) as response:
                if response.status == 200:
                    return url
        except Exception as e:
            logger.error(f"Error fetching logo from Clearbit for {domain}: {e}")
        return None

    async def get_logo_from_google(self, company_name: str) -> str | None:
        """Fetch logo from Google Custom Search API."""
        google_api_key = os.getenv("GOOGLE_API_KEY")
        google_cse_id = os.getenv("GOOGLE_CSE_ID")

        if not google_api_key or not google_cse_id:
            logger.warning("GOOGLE_API_KEY or GOOGLE_CSE_ID not set, skipping Google logo fetch")
            return None

        try:
            search_query = f"{company_name} logo"
            url = "https://www.googleapis.com/customsearch/v1"
            params = {
                "key": google_api_key,
                "cx": google_cse_id,
                "q": search_query,
                "searchType": "image",
                "num": 1,
            }

            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    if "items" in data and len(data["items"]) > 0:
                        return data["items"][0]["link"]  # type: ignore
        except Exception as e:
            logger.error(f"Error fetching logo from Google for {company_name}: {e}")
        return None

    async def get_logo_from_domain(self, domain: str) -> str | None:
        """Try to find logo by checking common paths on the company's domain."""
        if not domain:
            return None

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
                logo_url = f"https://{domain}{path}"
                async with self.session.head(logo_url, timeout=5) as response:
                    if response.status == 200:
                        return logo_url
            except Exception:
                continue

        return None

    async def find_best_logo(self, company: Company) -> str | None:
        """Find the best available logo for a company."""
        # Try Clearbit first (most reliable)
        if company.domains:
            for domain in company.domains:
                clean_domain = domain.strip().lower()
                if clean_domain.startswith("http"):
                    clean_domain = urlparse(clean_domain).netloc

                # Try Clearbit
                logo = await self.get_logo_from_clearbit(clean_domain)
                if logo:
                    logger.info(f"Found logo via Clearbit for {company.name}: {logo}")
                    return logo

                # Try domain-based search
                logo = await self.get_logo_from_domain(clean_domain)
                if logo:
                    logger.info(f"Found logo via domain search for {company.name}: {logo}")
                    return logo

        # Fallback to Google search
        logo = await self.get_logo_from_google(company.name)
        if logo:
            logger.info(f"Found logo via Google for {company.name}: {logo}")
            return logo

        logger.warning(f"No logo found for {company.name}")
        return None


async def main() -> None:
    """Main function to update all company logos."""
    logger.info("Starting company logo update process...")

    # Connect to database
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
    async with LogoFetcher() as fetcher:
        updated_count = 0
        error_count = 0

        for i, company in enumerate(companies, 1):
            logger.info(f"Processing {i}/{len(companies)}: {company.name}")

            # Skip if already has a logo
            if company.logo:
                logger.info(f"Skipping {company.name} - already has logo")
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

                # Add small delay to avoid rate limiting
                await asyncio.sleep(0.5)

            except Exception as e:
                logger.error(f"Error processing {company.name}: {e}")
                error_count += 1

    # Summary
    logger.info("Logo update process completed!")
    logger.info(f"Successfully updated: {updated_count}")
    logger.info(f"Errors: {error_count}")


if __name__ == "__main__":
    # Configure logging
    logger.remove()
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO",
    )
    logger.add(
        "logs/company_logos.log",
        rotation="10 MB",
        retention="7 days",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level="DEBUG",
    )

    # Run the script
    asyncio.run(main())
