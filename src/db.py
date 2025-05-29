import os

from dotenv import load_dotenv
from loguru import logger
from motor.core import AgnosticDatabase
from motor.motor_asyncio import AsyncIOMotorClient

from src.company import Company
from src.document import Document

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


async def get_company_by_slug(slug: str) -> Company:
    company = await mongo.db.companies.find_one({"slug": slug})
    if not company:
        raise ValueError(f"Company with slug {slug} not found")
    return Company(**company)


async def get_company_documents(company_slug: str) -> list[Document]:
    company = await get_company_by_slug(company_slug)
    documents = await mongo.db.documents.find({"company_id": company.id}).to_list(
        length=None
    )

    return [Document(**document) for document in documents]


async def get_all_companies() -> list[Company]:
    companies = await mongo.db.companies.find().to_list(length=None)
    return [Company(**company) for company in companies]


async def get_all_documents() -> list[Document]:
    documents = await mongo.db.documents.find().to_list(length=None)
    return [Document(**document) for document in documents]


async def update_document(document: Document):
    await mongo.db.documents.update_one(
        {"id": document.id},
        {"$set": document.model_dump(mode="json")},
    )
