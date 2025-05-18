import os

from dotenv import load_dotenv
from loguru import logger
from motor.core import AgnosticDatabase
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = "toast"

if not MONGO_URI:
    raise ValueError("MONGO_URI is not set")


class Database:
    client: AsyncIOMotorClient = None
    db: AgnosticDatabase = None


mongo = Database()


async def connect_to_mongo():
    """Connect to MongoDB."""
    mongo.client = AsyncIOMotorClient(MONGO_URI)
    mongo.db = mongo.client[DATABASE_NAME]
    logger.info(f"Connected to MongoDB at {MONGO_URI}")


async def close_mongo_connection():
    """Close MongoDB connection."""
    if mongo.client:
        mongo.client.close()
        logger.info("Closed MongoDB connection")
