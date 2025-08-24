#!/usr/bin/env python3
"""Test script to verify the EmbeddingService works correctly."""

import asyncio
from collections.abc import Coroutine
from typing import Any

from src.services.embedding_service import embedding_service


async def test_async_embedding() -> Coroutine[Any, Any, bool]:
    """Test async embedding functionality."""
    print("Testing async embedding...")

    try:
        result = await embedding_service.embed_single_company("test-company")
        print(f"Async embedding result: {result}")
        return result  # type: ignore
    except Exception as e:
        print(f"Async embedding error: {e}")
        return False  # type: ignore


def main() -> None:
    """Run all tests."""
    print("🧪 Testing EmbeddingService...")
    print("=" * 50)

    # Test async method
    asyncio.run(test_async_embedding())  # type: ignore
    print()

    print("✅ All tests completed!")


if __name__ == "__main__":
    main()
