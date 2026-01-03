"""Dashboard database utilities using isolated database connections."""

import certifi
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from src.core.config import config
from src.core.logging import get_logger
from src.models.document import Document
from src.models.product import Product

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


# Product functions
async def get_all_products_isolated() -> list[Product]:
    """Get all products with an isolated database connection, sorted by name"""
    db = await get_dashboard_db()
    try:
        # Get raw documents from MongoDB
        raw_products = await db.db.products.find().sort("name", 1).to_list(length=None)
        logger.info(f"Retrieved {len(raw_products)} raw product documents from MongoDB")

        if not raw_products:
            logger.warning("No products found in database")
            return []

        # Convert MongoDB documents to Product objects
        # Handle _id field conversion and ensure all required fields are present
        products = []
        for raw_product in raw_products:
            try:
                # Convert MongoDB document to dict, handling _id field
                product_dict = dict(raw_product)

                # Convert _id to id if present (MongoDB uses _id, our model uses id)
                if "_id" in product_dict and "id" not in product_dict:
                    product_dict["id"] = str(product_dict.pop("_id"))
                elif "_id" in product_dict:
                    # If both exist, keep id and remove _id
                    product_dict.pop("_id", None)

                # Ensure id is a string and exists
                if "id" not in product_dict:
                    logger.error(f"Product document missing 'id' field: {raw_product}")
                    continue

                product_dict["id"] = str(product_dict["id"])

                # Create Product object
                product = Product(**product_dict)
                products.append(product)
            except Exception as e:
                logger.error(f"Error converting product document to Product object: {e}")
                logger.error(f"Problematic document: {raw_product}")
                # Continue processing other products instead of failing completely
                continue

        logger.info(f"Successfully converted {len(products)} products")

        # Warn if we retrieved documents but couldn't convert any
        if raw_products and not products:
            logger.warning(
                f"Retrieved {len(raw_products)} documents from MongoDB but failed to convert any to Product objects. "
                "Check the error logs above for details about conversion failures."
            )

        return products
    except Exception as e:
        logger.error(f"Error getting products: {e}", exc_info=True)
        return []
    finally:
        await db.disconnect()


async def get_product_by_slug_isolated(slug: str) -> Product | None:
    """Get a product by slug with an isolated database connection"""
    db = await get_dashboard_db()
    try:
        product = await db.db.products.find_one({"slug": slug})
        if product:
            return Product(**product)
        return None
    except Exception as e:
        logger.error(f"Error getting product by slug {slug}: {e}")
        return None
    finally:
        await db.disconnect()


async def create_product_isolated(product: Product) -> bool:
    """Create a new product with an isolated database connection"""
    db = await get_dashboard_db()
    try:
        product_dict = product.model_dump()
        await db.db.products.insert_one(product_dict)
        logger.info(f"Created product {product.name} with ID {product.id}")
        return True
    except Exception as e:
        logger.error(f"Error creating product {product.name}: {e}")
        return False
    finally:
        await db.disconnect()


async def update_product_isolated(product: Product) -> bool:
    """Update an existing product with an isolated database connection"""
    db = await get_dashboard_db()
    try:
        result = await db.db.products.update_one({"id": product.id}, {"$set": product.model_dump()})
        success = result.modified_count > 0
        if success:
            logger.info(f"Updated product {product.id}")
        return bool(success)
    except Exception as e:
        logger.error(f"Error updating product {product.id}: {e}")
        return False
    finally:
        await db.disconnect()


async def delete_product_isolated(product_id: str) -> bool:
    """Delete a product with an isolated database connection"""
    db = await get_dashboard_db()
    try:
        result = await db.db.products.delete_one({"id": product_id})
        success = result.deleted_count > 0
        if success:
            logger.info(f"Deleted product {product_id}")
        return bool(success)
    except Exception as e:
        logger.error(f"Error deleting product {product_id}: {e}")
        return False
    finally:
        await db.disconnect()


# Document functions
async def get_product_documents_isolated(product_slug: str) -> list[Document]:
    """Get all documents for a product with an isolated database connection"""
    db = await get_dashboard_db()
    try:
        # First find the product by slug to get its ID
        product = await db.db.products.find_one({"slug": product_slug})
        if not product:
            logger.warning(f"Product with slug {product_slug} not found")
            return []

        # Get product_id (handle both _id and id fields)
        product_id = product.get("id") or str(product.get("_id", ""))
        if not product_id:
            logger.error(f"Product {product_slug} has no ID")
            return []

        # Query documents by product_id
        documents = await db.db.documents.find({"product_id": product_id}).to_list(length=None)
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
        logger.error(f"Error getting documents for product {product_slug}: {e}")
        return []
    finally:
        await db.disconnect()


async def get_product_documents_by_id_isolated(product_id: str) -> list[Document]:
    """Get all documents for a product by product_id with an isolated database connection"""
    db = await get_dashboard_db()
    try:
        documents = await db.db.documents.find({"product_id": product_id}).to_list(length=None)
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
        logger.error(f"Error getting documents for product_id {product_id}: {e}")
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


async def get_document_counts_by_product() -> dict[str, int]:
    """Get document counts for all products with an isolated database connection.

    Returns:
        Dictionary mapping product_id to document count
    """
    db = await get_dashboard_db()
    try:
        # Use aggregation to count documents per product_id
        pipeline = [
            {"$group": {"_id": "$product_id", "count": {"$sum": 1}}},
        ]
        results = await db.db.documents.aggregate(pipeline).to_list(length=None)

        # Convert to dictionary: product_id -> count
        counts = {result["_id"]: result["count"] for result in results if result.get("_id")}
        logger.info(f"Retrieved document counts for {len(counts)} products")
        return counts
    except Exception as e:
        logger.error(f"Error getting document counts by product: {e}")
        return {}
    finally:
        await db.disconnect()
