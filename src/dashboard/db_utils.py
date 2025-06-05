import os
from typing import Optional

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

from src.company import Company
from src.document import Document

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = "toast"


async def get_mongo_client():
    """Get a fresh MongoDB client for Streamlit operations"""
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DATABASE_NAME]
    return client, db


# Company functions
async def get_all_companies_isolated() -> list[Company]:
    """Get all companies with a fresh database connection"""
    client, db = await get_mongo_client()
    try:
        companies = await db.companies.find().to_list(length=None)
        return [Company(**company) for company in companies]
    finally:
        client.close()


async def get_company_by_slug_isolated(slug: str) -> Optional[Company]:
    """Get a company by slug with a fresh database connection"""
    client, db = await get_mongo_client()
    try:
        company = await db.companies.find_one({"slug": slug})
        if not company:
            return None
        return Company(**company)
    finally:
        client.close()


async def create_company_isolated(company: Company) -> bool:
    """Create a new company with a fresh database connection"""
    client, db = await get_mongo_client()
    try:
        result = await db.companies.insert_one(company.model_dump())
        return result.inserted_id is not None
    finally:
        client.close()


# Document functions (for future use)
async def get_company_documents_isolated(company_slug: str) -> list[Document]:
    """Get all documents for a company with a fresh database connection"""
    client, db = await get_mongo_client()
    try:
        # First get the company
        company = await db.companies.find_one({"slug": company_slug})
        if not company:
            return []

        # Then get the documents
        documents = await db.documents.find({"company_id": company["id"]}).to_list(
            length=None
        )
        return [Document(**document) for document in documents]
    finally:
        client.close()


async def get_all_documents_isolated() -> list[Document]:
    """Get all documents with a fresh database connection"""
    client, db = await get_mongo_client()
    try:
        documents = await db.documents.find().to_list(length=None)
        return [Document(**document) for document in documents]
    finally:
        client.close()
