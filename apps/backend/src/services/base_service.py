"""Base service class for database operations."""

import os
from typing import ClassVar

import certifi
from dotenv import load_dotenv
from motor.core import AgnosticDatabase
from motor.motor_asyncio import AsyncIOMotorClient

from core.logging import get_logger

load_dotenv()

logger = get_logger(__name__)

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = "toast"

if not MONGO_URI:
    raise ValueError("MONGO_URI is not set")


class BaseService:
    """Base service class that provides database connection and common functionality."""

    _instance: ClassVar["BaseService"] = None
    _client: AsyncIOMotorClient = None
    _db: AgnosticDatabase = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize_database()
        return cls._instance

    def _initialize_database(self):
        """Initialize the database connection."""
        if "+srv" in MONGO_URI:  # If the URI is a MongoDB Atlas URI, we need to use TLS
            self._client = AsyncIOMotorClient(MONGO_URI, tls=True, tlsCAFile=certifi.where())
        else:
            self._client = AsyncIOMotorClient(MONGO_URI)

        self._db = self._client[DATABASE_NAME]
        logger.info(f"Connected to MongoDB at {MONGO_URI}")

    @property
    def db(self) -> AgnosticDatabase:
        """Get the database instance."""
        return self._db

    @property
    def client(self) -> AsyncIOMotorClient:
        """Get the MongoDB client."""
        return self._client

    async def test_connection(self):
        """Test the database connection."""
        try:
            await self._client.admin.command("ping")
            db_names = await self._client.list_database_names()
            logger.info(f"db_names: {db_names}")
            logger.info("Connected to MongoDB")
        except Exception as e:
            logger.error(f"Error connecting to MongoDB: {e}")
            raise e

    def close_connection(self):
        """Close the database connection."""
        if self._client:
            self._client.close()
            logger.info("Closed MongoDB connection")
