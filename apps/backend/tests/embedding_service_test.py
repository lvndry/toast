#!/usr/bin/env python3
"""Test script to verify the EmbeddingService works correctly."""

import asyncio

from src.services.embedding_service import embedding_service


def test_single_company_embedding():
    """Test embedding a single company."""
    print("Testing single company embedding...")

    # Test with a sample company slug
    result = embedding_service.embed_single_company_sync("test-company")
    print(f"Single company result: {result}")

    return result


def test_multiple_companies_embedding():
    """Test embedding multiple companies."""
    print("Testing multiple companies embedding...")

    # Test with sample company slugs
    company_slugs = ["test-company-1", "test-company-2", "test-company-3"]
    results = embedding_service.embed_multiple_companies(company_slugs)

    print("Multiple companies results:")
    for slug, success in results:
        print(f"  {slug}: {'✅ Success' if success else '❌ Failed'}")

    return results


def test_embed_companies_unified():
    """Test the unified embed_companies method."""
    print("Testing unified embed_companies method...")

    # Test single company
    single_result = embedding_service.embed_companies("test-company")
    print(f"Single company via unified method: {single_result}")

    # Test multiple companies
    multiple_results = embedding_service.embed_companies(["test-company-1", "test-company-2"])
    print(f"Multiple companies via unified method: {multiple_results}")

    return single_result, multiple_results


async def test_async_embedding():
    """Test async embedding functionality."""
    print("Testing async embedding...")

    try:
        result = await embedding_service.embed_single_company("test-company")
        print(f"Async embedding result: {result}")
        return result
    except Exception as e:
        print(f"Async embedding error: {e}")
        return False


def main():
    """Run all tests."""
    print("🧪 Testing EmbeddingService...")
    print("=" * 50)

    # Test sync methods
    test_single_company_embedding()
    print()

    test_multiple_companies_embedding()
    print()

    test_embed_companies_unified()
    print()

    # Test async method
    asyncio.run(test_async_embedding())
    print()

    print("✅ All tests completed!")


if __name__ == "__main__":
    main()
