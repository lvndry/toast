import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = "toast"

if not MONGO_URI:
    raise ValueError("MONGO_URI is not set")

client: AsyncIOMotorClient = AsyncIOMotorClient(MONGO_URI)
