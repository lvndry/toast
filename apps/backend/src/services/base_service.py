"""Base service class for database operations."""

from __future__ import annotations

from typing import Self, cast

import certifi
from dotenv import load_dotenv
from motor.core import AgnosticDatabase
from motor.motor_asyncio import AsyncIOMotorClient

from src.core.config import settings
from src.core.logging import get_logger

load_dotenv()

logger = get_logger(__name__)

DATABASE_NAME = "toast"

MONGO_URI = settings.database.mongodb_uri


class BaseService:
    """Base service class that provides database connection and common functionality."""

    _instance: Self | None = None
    _client: AsyncIOMotorClient | None = None
    _db: AgnosticDatabase | None = None

    def __new__(cls) -> Self:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize_database()
        assert cls._instance is not None
        return cast(Self, cls._instance)

    def _initialize_database(self) -> None:
        """Initialize the database connection."""
        # If the URI is a MongoDB Atlas URI, we need to use TLS
        if "+srv" in MONGO_URI:
            self._client = AsyncIOMotorClient(MONGO_URI, tls=True, tlsCAFile=certifi.where())
        else:
            self._client = AsyncIOMotorClient(MONGO_URI)

        self._db = self._client[DATABASE_NAME]
        logger.info(f"Connected to MongoDB at {MONGO_URI}")

    @property
    def db(self) -> AgnosticDatabase:
        """Get the database instance."""
        if self._db is None:
            raise ValueError("Database not initialized")
        return self._db

    @property
    def client(self) -> AsyncIOMotorClient:
        """Get the MongoDB client."""
        if self._client is None:
            raise ValueError("Client not initialized")
        return self._client

    async def test_connection(self) -> None:
        """Test the database connection."""
        try:
            await self.client.admin.command("ping")
            db_names = await self.client.list_database_names()
            if "toast" not in db_names:
                raise Exception("Toast database not found")
            logger.info("Connected to MongoDB")
        except Exception as e:
            logger.error(f"Error connecting to MongoDB: {e}")
            raise e

    def close_connection(self) -> None:
        """Close the database connection."""
        if self._client:
            self._client.close()
            logger.info("Closed MongoDB connection")
