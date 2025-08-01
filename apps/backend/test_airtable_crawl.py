#!/usr/bin/env python3
"""
Test script to diagnose Airtable crawler issue.
"""

import asyncio
import logging

from src.toast_crawler import ToastCrawler, test_specific_url

# Set up logging to see debug messages
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


async def test_airtable_crawl():
    """Test the Airtable crawler to see why it didn't go deeper."""

    # Test specific URLs to see what's happening
    test_urls = [
        "https://airtable.com",
        "https://airtable.com/company",
        "https://airtable.com/company/tos",
    ]

    print("🔍 Testing Airtable crawler behavior...")
    print("=" * 50)

    for url in test_urls:
        print(f"\n📄 Testing URL: {url}")
        print("-" * 30)

        try:
            result = await test_specific_url(url)

            print(f"✅ Success: {result.success}")
            print(f"📄 Title: {result.title}")
            print(f"⚖️ Legal Score: {result.legal_score}")
            print(f"📊 Content Length: {len(result.content)} chars")
            print(f"🔗 Discovered URLs: {len(result.discovered_urls)}")

            if result.discovered_urls:
                print("🔗 First 10 discovered URLs:")
                for i, discovered_url in enumerate(result.discovered_urls[:10], 1):
                    print(f"  {i}. {discovered_url}")

            if not result.success:
                print(f"❌ Error: {result.error_message}")

        except Exception as e:
            print(f"❌ Exception: {e}")

    print("\n" + "=" * 50)
    print("🔍 Now testing full crawl with BFS strategy...")

    # Test full crawl
    crawler = ToastCrawler(
        max_depth=3,
        max_pages=50,
        strategy="bfs",
        min_legal_score=0.0,
        delay_between_requests=0.5,  # Faster for testing
    )

    try:
        results = await crawler.crawl("https://airtable.com")

        print(f"\n📊 Crawl completed! Found {len(results)} pages")
        print("\n🎯 Legal documents found:")
        legal_docs = [r for r in results if r.legal_score >= 2.0]
        for result in legal_docs:
            print(f"  📄 {result.title or 'Untitled'}")
            print(f"     URL: {result.url}")
            print(f"     Legal Score: {result.legal_score:.1f}")
            print()

        print("\n📋 All crawled URLs:")
        for i, result in enumerate(results, 1):
            print(f"  {i:2d}. {result.url} (Score: {result.legal_score:.1f})")

    except Exception as e:
        print(f"❌ Crawl failed: {e}")


if __name__ == "__main__":
    asyncio.run(test_airtable_crawl())
