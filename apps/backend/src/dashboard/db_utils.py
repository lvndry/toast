"""Dashboard database utilities using isolated database connections."""

import certifi
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from src.core.config import config
from src.core.logging import get_logger
from src.models.company import Company
from src.models.document import Document

logger = get_logger(__name__)

MONGO_URI = config.database.mongodb_uri


def get_database_name() -> str:
    """Get the database name from config or extract from URI."""
    # First, try to use the configured database name
    if config.database.mongodb_database:
        return config.database.mongodb_database

    # Fallback: try to extract from URI if database name is in the path
    # Format: mongodb://host:port/database_name
    if "/" in MONGO_URI:
        parts = MONGO_URI.split("/")
        if len(parts) > 1:
            # Get the last part after the last /
            db_name = parts[-1].split("?")[0]  # Remove query parameters
            if db_name:
                logger.info(f"Extracted database name '{db_name}' from MongoDB URI")
                return db_name

    # Default fallback
    # TODO: Change to clausea
    return "toast"


DATABASE_NAME = get_database_name()


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
            logger.info(f"Dashboard connected to MongoDB: {MONGO_URI}")
            logger.info(f"Using database: {DATABASE_NAME}")

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
    """Get all companies with an isolated database connection, sorted by name"""
    db = await get_dashboard_db()
    try:
        # Get raw documents from MongoDB
        raw_companies = await db.db.companies.find().sort("name", 1).to_list(length=None)
        logger.info(f"Retrieved {len(raw_companies)} raw company documents from MongoDB")

        if not raw_companies:
            logger.warning("No companies found in database")
            return []

        # Convert MongoDB documents to Company objects
        # Handle _id field conversion and ensure all required fields are present
        companies = []
        for raw_company in raw_companies:
            try:
                # Convert MongoDB document to dict, handling _id field
                company_dict = dict(raw_company)

                # Convert _id to id if present (MongoDB uses _id, our model uses id)
                if "_id" in company_dict and "id" not in company_dict:
                    company_dict["id"] = str(company_dict.pop("_id"))
                elif "_id" in company_dict:
                    # If both exist, keep id and remove _id
                    company_dict.pop("_id", None)

                # Ensure id is a string and exists
                if "id" not in company_dict:
                    logger.error(f"Company document missing 'id' field: {raw_company}")
                    continue

                company_dict["id"] = str(company_dict["id"])

                # Create Company object
                company = Company(**company_dict)
                companies.append(company)
            except Exception as e:
                logger.error(f"Error converting company document to Company object: {e}")
                logger.error(f"Problematic document: {raw_company}")
                # Continue processing other companies instead of failing completely
                continue

        logger.info(f"Successfully converted {len(companies)} companies")

        # Warn if we retrieved documents but couldn't convert any
        if raw_companies and not companies:
            logger.warning(
                f"Retrieved {len(raw_companies)} documents from MongoDB but failed to convert any to Company objects. "
                "Check the error logs above for details about conversion failures."
            )

        return companies
    except Exception as e:
        logger.error(f"Error getting companies: {e}", exc_info=True)
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
        # First find the company by slug to get its ID
        company = await db.db.companies.find_one({"slug": company_slug})
        if not company:
            logger.warning(f"Company with slug {company_slug} not found")
            return []

        # Get company_id (handle both _id and id fields)
        company_id = company.get("id") or str(company.get("_id", ""))
        if not company_id:
            logger.error(f"Company {company_slug} has no ID")
            return []

        # Query documents by company_id
        documents = await db.db.documents.find({"company_id": company_id}).to_list(length=None)
        # Convert MongoDB documents to Document objects
        result = []
        for doc in documents:
            try:
                # Handle _id field conversion
                doc_dict = dict(doc)
                if "_id" in doc_dict and "id" not in doc_dict:
                    doc_dict["id"] = str(doc_dict.pop("_id"))
                elif "_id" in doc_dict:
                    doc_dict.pop("_id", None)
                result.append(Document(**doc_dict))
            except Exception as e:
                logger.error(f"Error converting document to Document object: {e}")
                continue
        return result
    except Exception as e:
        logger.error(f"Error getting documents for company {company_slug}: {e}")
        return []
    finally:
        await db.disconnect()


async def get_company_documents_by_id_isolated(company_id: str) -> list[Document]:
    """Get all documents for a company by company_id with an isolated database connection"""
    db = await get_dashboard_db()
    try:
        documents = await db.db.documents.find({"company_id": company_id}).to_list(length=None)
        # Convert MongoDB documents to Document objects
        result = []
        for doc in documents:
            try:
                # Handle _id field conversion
                doc_dict = dict(doc)
                if "_id" in doc_dict and "id" not in doc_dict:
                    doc_dict["id"] = str(doc_dict.pop("_id"))
                elif "_id" in doc_dict:
                    doc_dict.pop("_id", None)
                result.append(Document(**doc_dict))
            except Exception as e:
                logger.error(f"Error converting document to Document object: {e}")
                continue
        return result
    except Exception as e:
        logger.error(f"Error getting documents for company_id {company_id}: {e}")
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


async def get_document_counts_by_company() -> dict[str, int]:
    """Get document counts for all companies with an isolated database connection.

    Returns:
        Dictionary mapping company_id to document count
    """
    db = await get_dashboard_db()
    try:
        # Use aggregation to count documents per company_id
        pipeline = [
            {"$group": {"_id": "$company_id", "count": {"$sum": 1}}},
        ]
        results = await db.db.documents.aggregate(pipeline).to_list(length=None)

        # Convert to dictionary: company_id -> count
        counts = {result["_id"]: result["count"] for result in results if result.get("_id")}
        logger.info(f"Retrieved document counts for {len(counts)} companies")
        return counts
    except Exception as e:
        logger.error(f"Error getting document counts by company: {e}")
        return {}
    finally:
        await db.disconnect()
