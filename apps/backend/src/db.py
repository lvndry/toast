import os
from datetime import datetime

import certifi
from dotenv import load_dotenv
from loguru import logger
from motor.core import AgnosticDatabase
from motor.motor_asyncio import AsyncIOMotorClient

from src.company import Company
from src.conversation import Conversation, Message
from src.document import Document, DocumentAnalysis
from src.user import User

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
        if "+srv" in MONGO_URI:  # If the URI is a MongoDB Atlas URI, we need to use TLS
            self.client = AsyncIOMotorClient(
                MONGO_URI, tls=True, tlsCAFile=certifi.where()
            )
        else:
            self.client = AsyncIOMotorClient(MONGO_URI)

        self.db = self.client[DATABASE_NAME]
        logger.info(f"Connected to MongoDB at {MONGO_URI}")

    async def test_connection(self):
        try:
            await self.client.admin.command("ping")
            db_names = await self.client.list_database_names()
            logger.info(f"db_names: {db_names}")
            logger.info("Connected to MongoDB")
        except Exception as e:
            logger.error(f"Error connecting to MongoDB: {e}")
            raise e

    def close_mongo_connection(self):
        self.client.close()
        logger.info("Closed MongoDB connection")


mongo = Database()

# try:
#     loop = asyncio.get_running_loop()
# except RuntimeError:
#     loop = None
#
# if loop and loop.is_running():
#     asyncio.create_task(mongo.test_connection())
# else:
#     asyncio.run(mongo.test_connection())


##### Company ######
async def get_company_by_id(id: str) -> Company:
    company = await mongo.db.companies.find_one({"id": id})
    if not company:
        raise ValueError(f"Company with id {id} not found")
    return Company(**company)


async def get_company_by_slug(slug: str) -> Company:
    company = await mongo.db.companies.find_one({"slug": slug})
    if not company:
        raise ValueError(f"Company with slug {slug} not found")
    return Company(**company)


async def get_all_companies() -> list[Company]:
    companies = await mongo.db.companies.find().to_list(length=None)
    return [Company(**company) for company in companies]


###########


####### Documents #######
async def get_all_documents() -> list[Document]:
    documents = await mongo.db.documents.find().to_list(length=None)
    return [Document(**document) for document in documents]


async def get_company_documents(company_slug: str) -> list[Document]:
    company = await get_company_by_slug(company_slug)
    documents = await mongo.db.documents.find({"company_id": company.id}).to_list(
        length=None
    )

    return [Document(**document) for document in documents]


async def get_document_by_url(url: str) -> Document | None:
    """Get a document by its URL from the database."""
    doc = await mongo.db.documents.find_one({"url": url})
    return Document(**doc) if doc else None


async def update_document(document: Document):
    await mongo.db.documents.update_one(
        {"id": document.id},
        {"$set": document.model_dump(mode="json")},
    )


###########


####### Users #######
async def upsert_user(user: User) -> User:
    existing = await mongo.db.users.find_one({"id": user.id})
    now = datetime.now()
    doc = user.model_dump(mode="json")
    doc["updated_at"] = now
    if existing:
        await mongo.db.users.update_one({"id": user.id}, {"$set": doc})
    else:
        doc["created_at"] = now
        await mongo.db.users.insert_one(doc)
    return user


async def get_user_by_id(user_id: str) -> User | None:
    doc = await mongo.db.users.find_one({"id": user_id})
    return User(**doc) if doc else None


async def set_user_onboarding_completed(user_id: str) -> None:
    now = datetime.now()
    await mongo.db.users.update_one(
        {"id": user_id},
        {"$set": {"onboarding_completed": True, "updated_at": now}},
        upsert=False,
    )


###########


####### Meta Summaries #######
async def get_company_meta_summary(company_slug: str) -> DocumentAnalysis | None:
    """Get a meta summary for a company from the database."""
    try:
        company = await get_company_by_slug(company_slug)
        meta_summary_doc = await mongo.db.meta_summaries.find_one(
            {"company_id": company.id}
        )
        if meta_summary_doc:
            return DocumentAnalysis(**meta_summary_doc["analysis"])
        return None
    except Exception as e:
        logger.error(f"Error getting meta summary for {company_slug}: {e}")
        return None


async def store_company_meta_summary(company_slug: str, meta_summary: DocumentAnalysis):
    """Store a meta summary for a company in the database."""
    try:
        company = await get_company_by_slug(company_slug)
        meta_summary_doc = {
            "company_id": company.id,
            "company_slug": company_slug,
            "analysis": meta_summary.model_dump(),
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
        }

        # Use upsert to either insert new or update existing
        await mongo.db.meta_summaries.update_one(
            {"company_id": company.id}, {"$set": meta_summary_doc}, upsert=True
        )
        logger.info(f"Stored meta summary for company {company_slug}")
    except Exception as e:
        logger.error(f"Error storing meta summary for {company_slug}: {e}")
        raise e


###########


####### Conversations #######
async def create_conversation(conversation: Conversation) -> Conversation:
    """Create a new conversation in the database."""
    await mongo.db.conversations.insert_one(conversation.model_dump(mode="json"))
    return conversation


async def get_conversation_by_id(conversation_id: str) -> Conversation | None:
    """Get a conversation by its ID."""
    conversation_doc = await mongo.db.conversations.find_one({"id": conversation_id})
    return Conversation(**conversation_doc) if conversation_doc else None


async def get_user_conversations(user_id: str) -> list[Conversation]:
    """Get all conversations for a user."""
    conversations = await mongo.db.conversations.find({"user_id": user_id}).to_list(
        length=None
    )
    return [Conversation(**conversation) for conversation in conversations]


async def update_conversation(conversation: Conversation):
    """Update a conversation in the database."""
    conversation.updated_at = datetime.now()
    await mongo.db.conversations.update_one(
        {"id": conversation.id},
        {"$set": conversation.model_dump(mode="json")},
    )


async def add_message_to_conversation(conversation_id: str, message: Message):
    """Add a message to a conversation."""
    await mongo.db.conversations.update_one(
        {"id": conversation_id},
        {
            "$push": {"messages": message.model_dump(mode="json")},
            "$set": {"updated_at": datetime.now()},
        },
    )


async def add_document_to_conversation(conversation_id: str, document_id: str):
    """Add a document to a conversation."""
    await mongo.db.conversations.update_one(
        {"id": conversation_id},
        {"$push": {"documents": document_id}, "$set": {"updated_at": datetime.now()}},
    )


###########
