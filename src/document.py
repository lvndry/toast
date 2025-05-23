import hashlib
from datetime import UTC, datetime
from typing import Literal

from pydantic import BaseModel

from src.db import mongo

DocumentCategory = Literal["privacy", "terms", "cookies", "other"]


class Document(BaseModel):
    id: str
    url: str
    company_id: str
    doc_type: DocumentCategory
    markdown: str
    metadata: dict
    versions: list[dict]


class DocumentService:
    def __init__(self):
        # Enable compression for large texts

        # Archive older versions when exceeding this count
        self.max_versions_inline = 3

        self.documents = mongo.db.documents
        self.versions = mongo.db.document_versions

    async def _archive_oldest_version(self, doc: dict):
        await self.versions.insert_one(
            {
                "doc_id": doc["id"],
                "content": doc["markdown"],
                "metadata": doc["metadata"],
                "created_at": datetime.now(UTC),
            }
        )

    async def store_document(self, doc: Document):
        content_hash = hashlib.sha256(doc.markdown.encode()).hexdigest()
        doc_id = doc.id

        # Check if content changed
        existing = await self.documents.find_one({"id": doc_id})
        if existing and existing["latest_markdown_hash"] == content_hash:
            return False

        # Prepare new version
        new_version = {
            "version": existing["current_version"] + 1 if existing else 1,
            "extracted_at": datetime.now(UTC),
            "metadata": doc.metadata,
            # "changes": self._detect_changes(existing, doc) if existing else None,
            # "vector_id": await self._store_in_vector_db(doc.markdown),
        }

        # Update main document
        await self.documents.update_one(
            {"id": doc_id},
            {
                "$set": {
                    "current_version": new_version["version"],
                    "latest_markdown_hash": content_hash,
                    "domain": doc.domain,
                    "doc_type": doc.doc_type,
                },
                "$push": {
                    "versions": {
                        "$each": [new_version],
                        "$position": 0,
                        "$slice": self.max_versions_inline,
                    }
                },
                "$setOnInsert": {"first_extracted": datetime.now(UTC)},
            },
            upsert=True,
        )

        # Store full content in versions collection
        await self.versions.insert_one(
            {
                "doc_id": doc_id,
                "version": new_version["version"],
                "markdown": doc.markdown,
                "metadata": doc.metadata,
                "extracted_at": new_version["extracted_at"],
            }
        )

    async def get_documents_by_type(self, doc_type: DocumentCategory):
        return await self.documents.find({"doc_type": doc_type}).to_list(None)

    async def get_documents_by_company_id(self, company_id: str):
        return await self.documents.find({"company_id": company_id}).to_list(None)
