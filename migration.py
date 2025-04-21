"""Migrate from SQL to NOSQL"""

import asyncio
import asyncpg
from motor.motor_asyncio import AsyncIOMotorClient
from loguru import logger

# Connection settings
POSTGRES_URL = "postgresql://lvndry@localhost/toast"
MONGO_URI = "mongodb://localhost:27017"
MONGO_DB = "toast"


async def migrate_data():
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


if __name__ == "__main__":
    # First inspect the schema to understand the data structure
    asyncio.run(inspect_postgres_schema())

    asyncio.run(migrate_data())
