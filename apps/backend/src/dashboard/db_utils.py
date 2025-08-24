"""Dashboard database utilities using isolated database connections."""

import certifi
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from src.company import Company
from src.core.config import settings
from src.core.logging import get_logger
from src.document import Document

logger = get_logger(__name__)

MONGO_URI = settings.database.mongodb_uri
DATABASE_NAME = "toast"


class DashboardDB:
    """Isolated database connection for Streamlit dashboard."""

    def __init__(self) -> None:
        self._client: AsyncIOMotorClient | None = None
        self._db: AsyncIOMotorDatabase | None = None

    async def connect(self) -> None:
        """Create a new database connection."""
        if self._client is None:
            if "+srv" in MONGO_URI:
                self._client = AsyncIOMotorClient(MONGO_URI, tls=True, tlsCAFile=certifi.where())
            else:
                self._client = AsyncIOMotorClient(MONGO_URI)
            self._db = self._client[DATABASE_NAME]
            logger.info("Dashboard connected to MongoDB")

    async def disconnect(self) -> None:
        """Close the database connection."""
        if self._client:
            self._client.close()
            self._client = None
            self._db = None
            logger.info("Dashboard disconnected from MongoDB")

    @property
    def db(self) -> AsyncIOMotorDatabase:
        """Get the database instance."""
        if self._db is None:
            raise ValueError("Database not initialized")
        return self._db

    @property
    def client(self) -> AsyncIOMotorClient:
        """Get the client instance."""
        if self._client is None:
            raise ValueError("Client not initialized")
        return self._client


async def get_dashboard_db() -> DashboardDB:
    """Get a dashboard database instance."""
    db = DashboardDB()
    await db.connect()
    return db


# Company functions
async def get_all_companies_isolated() -> list[Company]:
    """Get all companies with an isolated database connection"""
    db = await get_dashboard_db()
    try:
        companies = await db.db.companies.find().to_list(length=None)
        return [Company(**company) for company in companies]
    except Exception as e:
        logger.error(f"Error getting companies: {e}")
        return []
    finally:
        await db.disconnect()


async def get_company_by_slug_isolated(slug: str) -> Company | None:
    """Get a company by slug with an isolated database connection"""
    db = await get_dashboard_db()
    try:
        company = await db.db.companies.find_one({"slug": slug})
        if company:
            return Company(**company)
        return None
    except Exception as e:
        logger.error(f"Error getting company by slug {slug}: {e}")
        return None
    finally:
        await db.disconnect()


async def create_company_isolated(company: Company) -> bool:
    """Create a new company with an isolated database connection"""
    db = await get_dashboard_db()
    try:
        company_dict = company.model_dump()
        await db.db.companies.insert_one(company_dict)
        logger.info(f"Created company {company.name} with ID {company.id}")
        return True
    except Exception as e:
        logger.error(f"Error creating company {company.name}: {e}")
        return False
    finally:
        await db.disconnect()


async def update_company_isolated(company: Company) -> bool:
    """Update an existing company with an isolated database connection"""
    db = await get_dashboard_db()
    try:
        result = await db.db.companies.update_one(
            {"id": company.id}, {"$set": company.model_dump()}
        )
        success = result.modified_count > 0
        if success:
            logger.info(f"Updated company {company.id}")
        return bool(success)
    except Exception as e:
        logger.error(f"Error updating company {company.id}: {e}")
        return False
    finally:
        await db.disconnect()


async def delete_company_isolated(company_id: str) -> bool:
    """Delete a company with an isolated database connection"""
    db = await get_dashboard_db()
    try:
        result = await db.db.companies.delete_one({"id": company_id})
        success = result.deleted_count > 0
        if success:
            logger.info(f"Deleted company {company_id}")
        return bool(success)
    except Exception as e:
        logger.error(f"Error deleting company {company_id}: {e}")
        return False
    finally:
        await db.disconnect()


# Document functions
async def get_company_documents_isolated(company_slug: str) -> list[Document]:
    """Get all documents for a company with an isolated database connection"""
    db = await get_dashboard_db()
    try:
        documents = await db.db.documents.find({"company_slug": company_slug}).to_list(length=None)
        return [Document(**doc) for doc in documents]
    except Exception as e:
        logger.error(f"Error getting documents for company {company_slug}: {e}")
        return []
    finally:
        await db.disconnect()


async def get_all_documents_isolated() -> list[Document]:
    """Get all documents with an isolated database connection"""
    db = await get_dashboard_db()
    try:
        documents = await db.db.documents.find().to_list(length=None)
        return [Document(**doc) for doc in documents]
    except Exception as e:
        logger.error(f"Error getting all documents: {e}")
        return []
    finally:
        await db.disconnect()
