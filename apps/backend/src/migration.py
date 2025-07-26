import os
from datetime import datetime
from typing import Any, Dict

import certifi
from dotenv import load_dotenv
from loguru import logger
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()


class MigrationManager:
    def __init__(self):
        self.local_uri = os.getenv("MONGO_URI")
        self.production_uri = os.getenv("PRODUCTION_MONGO_URI")
        self.database_name = "toast"

        if not self.local_uri:
            raise ValueError("MONGO_URI is not set")
        if not self.production_uri:
            raise ValueError("PRODUCTION_MONGO_URI is not set")

        self.local_client = None
        self.production_client = None
        self.local_db = None
        self.production_db = None

    async def connect_databases(self):
        """Connect to both local and production databases."""
        try:
            # Connect to local database
            if "+srv" in self.local_uri:
                self.local_client = AsyncIOMotorClient(
                    self.local_uri, tls=True, tlsCAFile=certifi.where()
                )
            else:
                self.local_client = AsyncIOMotorClient(self.local_uri)

            self.local_db = self.local_client[self.database_name]
            logger.info("Connected to local MongoDB")

            # Connect to production database
            if "+srv" in self.production_uri:
                self.production_client = AsyncIOMotorClient(
                    self.production_uri, tls=True, tlsCAFile=certifi.where()
                )
            else:
                self.production_client = AsyncIOMotorClient(self.production_uri)

            self.production_db = self.production_client[self.database_name]
            logger.info("Connected to production MongoDB")

        except Exception as e:
            logger.error(f"Error connecting to databases: {e}")
            raise e

    async def close_connections(self):
        """Close database connections."""
        if self.local_client:
            self.local_client.close()
        if self.production_client:
            self.production_client.close()
        logger.info("Closed database connections")

    async def get_collection_stats(self, collection_name: str) -> Dict[str, int]:
        """Get statistics for a collection in both databases."""
        try:
            local_count = await self.local_db[collection_name].count_documents({})
            production_count = await self.production_db[
                collection_name
            ].count_documents({})

            return {
                "local_count": local_count,
                "production_count": production_count,
                "collection": collection_name,
            }
        except Exception as e:
            logger.error(f"Error getting stats for {collection_name}: {e}")
            return {
                "local_count": 0,
                "production_count": 0,
                "collection": collection_name,
            }

    async def migrate_companies(self, dry_run: bool = True) -> Dict[str, Any]:
        """Migrate companies from local to production."""
        try:
            companies = await self.local_db.companies.find().to_list(length=None)
            migrated_count = 0
            skipped_count = 0
            errors = []

            for company_data in companies:
                try:
                    # Check if company already exists in production
                    existing = await self.production_db.companies.find_one(
                        {"id": company_data["id"]}
                    )

                    if existing:
                        skipped_count += 1
                        logger.info(
                            f"Company {company_data.get('name', 'Unknown')} already exists in production"
                        )
                        continue

                    if not dry_run:
                        await self.production_db.companies.insert_one(company_data)
                        migrated_count += 1
                        logger.info(
                            f"Migrated company: {company_data.get('name', 'Unknown')}"
                        )
                    else:
                        migrated_count += 1
                        logger.info(
                            f"Would migrate company: {company_data.get('name', 'Unknown')}"
                        )

                except Exception as e:
                    error_msg = f"Error migrating company {company_data.get('name', 'Unknown')}: {e}"
                    errors.append(error_msg)
                    logger.error(error_msg)

            return {
                "migrated_count": migrated_count,
                "skipped_count": skipped_count,
                "errors": errors,
                "dry_run": dry_run,
            }

        except Exception as e:
            logger.error(f"Error in migrate_companies: {e}")
            raise e

    async def migrate_documents(self, dry_run: bool = True) -> Dict[str, Any]:
        """Migrate documents from local to production."""
        try:
            documents = await self.local_db.documents.find().to_list(length=None)
            migrated_count = 0
            skipped_count = 0
            errors = []

            for doc_data in documents:
                try:
                    # Check if document already exists in production
                    existing = await self.production_db.documents.find_one(
                        {"id": doc_data["id"]}
                    )

                    if existing:
                        skipped_count += 1
                        logger.info(
                            f"Document {doc_data.get('url', 'Unknown')} already exists in production"
                        )
                        continue

                    if not dry_run:
                        await self.production_db.documents.insert_one(doc_data)
                        migrated_count += 1
                        logger.info(
                            f"Migrated document: {doc_data.get('url', 'Unknown')}"
                        )
                    else:
                        migrated_count += 1
                        logger.info(
                            f"Would migrate document: {doc_data.get('url', 'Unknown')}"
                        )

                except Exception as e:
                    error_msg = f"Error migrating document {doc_data.get('url', 'Unknown')}: {e}"
                    errors.append(error_msg)
                    logger.error(error_msg)

            return {
                "migrated_count": migrated_count,
                "skipped_count": skipped_count,
                "errors": errors,
                "dry_run": dry_run,
            }

        except Exception as e:
            logger.error(f"Error in migrate_documents: {e}")
            raise e

    async def migrate_meta_summaries(self, dry_run: bool = True) -> Dict[str, Any]:
        """Migrate meta summaries from local to production."""
        try:
            meta_summaries = await self.local_db.meta_summaries.find().to_list(
                length=None
            )
            migrated_count = 0
            skipped_count = 0
            errors = []

            for summary_data in meta_summaries:
                try:
                    # Check if meta summary already exists in production
                    existing = await self.production_db.meta_summaries.find_one(
                        {"company_id": summary_data["company_id"]}
                    )

                    if existing:
                        skipped_count += 1
                        logger.info(
                            f"Meta summary for company {summary_data.get('company_slug', 'Unknown')} already exists in production"
                        )
                        continue

                    if not dry_run:
                        await self.production_db.meta_summaries.insert_one(summary_data)
                        migrated_count += 1
                        logger.info(
                            f"Migrated meta summary for company: {summary_data.get('company_slug', 'Unknown')}"
                        )
                    else:
                        migrated_count += 1
                        logger.info(
                            f"Would migrate meta summary for company: {summary_data.get('company_slug', 'Unknown')}"
                        )

                except Exception as e:
                    error_msg = f"Error migrating meta summary for company {summary_data.get('company_slug', 'Unknown')}: {e}"
                    errors.append(error_msg)
                    logger.error(error_msg)

            return {
                "migrated_count": migrated_count,
                "skipped_count": skipped_count,
                "errors": errors,
                "dry_run": dry_run,
            }

        except Exception as e:
            logger.error(f"Error in migrate_meta_summaries: {e}")
            raise e

    async def get_migration_summary(self) -> Dict[str, Any]:
        """Get a summary of what would be migrated."""
        collections = ["companies", "documents", "meta_summaries"]
        stats = {}

        for collection in collections:
            stats[collection] = await self.get_collection_stats(collection)

        return {
            "timestamp": datetime.now().isoformat(),
            "collections": stats,
            "local_uri": self.local_uri[:20] + "..."
            if len(self.local_uri) > 20
            else self.local_uri,
            "production_uri": self.production_uri[:20] + "..."
            if len(self.production_uri) > 20
            else self.production_uri,
        }

    async def run_full_migration(self, dry_run: bool = True) -> Dict[str, Any]:
        """Run a full migration of all data."""
        try:
            await self.connect_databases()

            summary = await self.get_migration_summary()
            companies_result = await self.migrate_companies(dry_run)
            documents_result = await self.migrate_documents(dry_run)
            meta_summaries_result = await self.migrate_meta_summaries(dry_run)

            return {
                "summary": summary,
                "companies": companies_result,
                "documents": documents_result,
                "meta_summaries": meta_summaries_result,
                "dry_run": dry_run,
                "timestamp": datetime.now().isoformat(),
            }

        finally:
            await self.close_connections()
