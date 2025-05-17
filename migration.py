"""Migrate from SQL to NOSQL"""

import asyncio

import asyncpg
from loguru import logger
from motor.motor_asyncio import AsyncIOMotorClient

# Connection settings
POSTGRES_URL = "postgresql://lvndry@localhost/toast"
MONGO_URI = "mongodb://localhost:27017"
MONGO_DB = "toast"


async def migrate_from_sql_to_mongo():
    """Migrate data from PostgreSQL to MongoDB"""
    # Connect to PostgreSQL
    pg_conn = await asyncpg.connect(POSTGRES_URL)

    # Connect to MongoDB
    mongo_client = AsyncIOMotorClient(MONGO_URI)
    mongo_db = mongo_client[MONGO_DB]

    try:
        # 1. Migrate companies
        logger.info("Migrating companies...")
        companies = await pg_conn.fetch("SELECT * FROM companies")

        for company in companies:
            company_dict = dict(company)
            # Convert PostgreSQL specific types if needed
            company_id = company_dict.pop("id")  # Remove the 'id' field
            # Use the original id as _id for continuity
            company_dict["_id"] = company_id

            # Insert the company into MongoDB
            await mongo_db.companies.insert_one(company_dict)

        logger.info(f"Migrated {len(companies)} companies")

        # 2. Migrate documents
        logger.info("Migrating documents...")
        documents = await pg_conn.fetch("SELECT * FROM documents")

        for document in documents:
            document_dict = dict(document)
            # Convert PostgreSQL specific types if needed
            document_id = document_dict.pop("id")  # Remove the 'id' field
            document_dict["_id"] = document_id

            # Make sure any date/time fields are properly converted
            # This depends on your schema

            # Insert the document into MongoDB
            await mongo_db.documents.insert_one(document_dict)

        logger.info(f"Migrated {len(documents)} documents")

        # Add more tables as needed

        logger.info("Migration completed successfully")

    except Exception as e:
        logger.error(f"Migration error: {str(e)}")

    finally:
        # Close connections
        await pg_conn.close()
        mongo_client.close()


async def inspect_postgres_schema():
    """Print the PostgreSQL schema for reference"""
    pg_conn = await asyncpg.connect(POSTGRES_URL)

    try:
        # Get all tables
        tables = await pg_conn.fetch("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
        """)

        for table in tables:
            table_name = table["table_name"]
            logger.info(f"Table: {table_name}")

            # Get columns for this table
            columns = await pg_conn.fetch(
                """
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = $1
            """,
                table_name,
            )

            for column in columns:
                logger.info(f"  - {column['column_name']}: {column['data_type']}")

            logger.info("---")

    except Exception as e:
        logger.error(f"Schema inspection error: {str(e)}")

    finally:
        await pg_conn.close()


async def migrate_crawl_base_urls():
    """
    Migrate the crawl_base_urls field from documents collection to companies collection.
    Only remove from documents after confirming successful migration.

    Args:
        db: Motor database connection
    """
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[MONGO_DB]
    # Find all documents with crawl_base_urls field
    documents = await db.documents.find({"crawl_base_urls": {"$exists": True}}).to_list(
        None
    )

    print(f"Found {len(documents)} documents with crawl_base_urls field")

    successful = 0
    failed = 0

    for doc in documents:
        # Check if document has company_id
        if "company_id" not in doc:
            print(f"Document {doc['_id']} has no company_id, skipping")
            failed += 1
            continue

        company_id = doc["company_id"]
        crawl_base_urls = doc["crawl_base_urls"]

        # Check if company exists
        company = await db.companies.find_one({"_id": company_id})
        if not company:
            print(f"Company {company_id} not found, skipping")
            failed += 1
            continue

        # Update company with crawl_base_urls
        result = await db.companies.update_one(
            {"_id": company_id}, {"$set": {"crawl_base_urls": crawl_base_urls}}
        )

        # If update was successful, remove field from document
        if result.modified_count > 0:
            await db.documents.update_one(
                {"_id": doc["_id"]}, {"$unset": {"crawl_base_urls": ""}}
            )
            successful += 1
            print(f"Migrated crawl_base_urls for company {company_id}")
        else:
            failed += 1
            print(f"Failed to update company {company_id}")

    print(f"\nMigration complete: {successful} successful, {failed} failed")


if __name__ == "__main__":
    # First inspect the schema to understand the data structure
    # asyncio.run(inspect_postgres_schema())
    asyncio.run(migrate_crawl_base_urls())
