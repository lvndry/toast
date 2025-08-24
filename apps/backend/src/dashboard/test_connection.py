"""Test database connection for Streamlit dashboard debugging."""

import asyncio

import certifi
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

from src.core.config import settings

# Load environment variables from .env file
load_dotenv()

MONGO_URI = settings.database.mongodb_uri
DATABASE_NAME = "toast"


async def test_connection() -> bool:
    """Test MongoDB connection and basic operations."""
    if not MONGO_URI:
        print("❌ MONGO_URI environment variable is not set")
        print("💡 Please set MONGO_URI in your .env file")
        return False

    try:
        print("🔗 Connecting to MongoDB...")
        print(f"📡 Using URI: {MONGO_URI[:50]}...")

        # Create client
        if "+srv" in MONGO_URI:
            client = AsyncIOMotorClient(MONGO_URI, tls=True, tlsCAFile=certifi.where())
        else:
            client = AsyncIOMotorClient(MONGO_URI)

        # Test connection
        await client.admin.command("ping")
        print("✅ MongoDB connection successful")

        # Get database
        db = client[DATABASE_NAME]

        # Test basic operations
        print("📊 Testing database operations...")

        # Count companies
        companies_count = await db.companies.count_documents({})
        print(f"✅ Found {companies_count} companies in database")

        # Count documents
        documents_count = await db.documents.count_documents({})
        print(f"✅ Found {documents_count} documents in database")

        # List collections
        collections = await db.list_collection_names()
        print(f"✅ Available collections: {collections}")

        client.close()
        print("✅ All tests passed!")
        return True

    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("💡 Troubleshooting tips:")
        print("• Check that your MongoDB instance is running")
        print("• Verify your connection string is correct")
        print("• Make sure you have network access to MongoDB")
        print("• For MongoDB Atlas, check your IP whitelist")
        return False


if __name__ == "__main__":
    success = asyncio.run(test_connection())
    if not success:
        exit(1)
