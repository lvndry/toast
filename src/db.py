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

    def __init__(self):
        self.connect_to_mongo()

    def connect_to_mongo(self):
        self.client = AsyncIOMotorClient(MONGO_URI)
        self.db = self.client[DATABASE_NAME]
        logger.info(f"Connected to MongoDB at {MONGO_URI}")

    def close_mongo_connection(self):
        self.client.close()
        logger.info("Closed MongoDB connection")


mongo = Database()
