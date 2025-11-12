"""Document service for managing document operations."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from src.core.logging import get_logger
from src.document import Document, DocumentAnalysis
from src.services.base_service import BaseService
from src.services.company_service import company_service

logger = get_logger(__name__)


class DocumentService(BaseService):
    """Service for document-related database operations."""

    _instance: DocumentService | None = None

    def __new__(cls) -> DocumentService:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def get_all_documents(self) -> list[Document]:
        """Get all documents from the database."""
        documents: list[Document] = await self.db.documents.find().to_list(length=None)
        return [Document(**document) for document in documents]

    async def get_document_by_id(self, document_id: str) -> Document | None:
        """Get a document by its ID."""
        document = await self.db.documents.find_one({"id": document_id})
        if not document:
            return None
        return Document(**document)

    async def get_document_by_url(self, url: str) -> Document | None:
        """Get a document by its URL."""
        document = await self.db.documents.find_one({"url": url})
        if not document:
            return None
        return Document(**document)

    async def get_company_documents(self, company_id: str) -> list[Document]:
        """Get all documents for a specific company."""
        documents: list[Document] = await self.db.documents.find(
            {"company_id": company_id}
        ).to_list(length=None)
        return [Document(**document) for document in documents]

    async def get_company_documents_by_slug(self, company_slug: str) -> list[Document]:
        """Get all documents for a specific company."""
        company = await company_service.get_company_by_slug(company_slug)
        if not company:
            raise ValueError(f"Company with slug {company_slug} not found")
        documents: list[Document] = await self.db.documents.find(
            {"company_id": company.id}
        ).to_list(length=None)
        return [Document(**document) for document in documents]

    async def store_document(self, document: Document) -> Document:
        """Store a document in the database."""
        try:
            document_dict = document.model_dump()
            await self.db.documents.insert_one(document_dict)
            logger.info(f"Stored document {document.id} for company {document.company_id}")
            # Invalidate meta-summary cache for this company when new document is added
            try:
                company = await company_service.get_company_by_id(document.company_id)
                await company_service.invalidate_meta_summary_cache(company.slug)
                logger.debug(f"Invalidated meta-summary cache for company {company.slug}")
            except Exception as cache_error:
                # Don't fail document storage if cache invalidation fails
                logger.warning(
                    f"Failed to invalidate cache for document {document.id}: {cache_error}"
                )
            return document
        except Exception as e:
            logger.error(f"Error storing document {document.id}: {e}")
            raise e

    async def update_document(self, document: Document) -> bool:
        """Update a document in the database."""
        try:
            result = await self.db.documents.update_one(
                {"id": document.id}, {"$set": document.model_dump()}
            )
            success = result.modified_count > 0
            if success:
                logger.info(f"Updated document {document.id}")
                # Invalidate meta-summary cache for this company when document changes
                try:
                    company = await company_service.get_company_by_id(document.company_id)
                    await company_service.invalidate_meta_summary_cache(company.slug)
                    logger.debug(f"Invalidated meta-summary cache for company {company.slug}")
                except Exception as cache_error:
                    # Don't fail document update if cache invalidation fails
                    logger.warning(
                        f"Failed to invalidate cache for document {document.id}: {cache_error}"
                    )
            else:
                logger.warning(f"No document found with id {document.id} to update")
            return bool(success)
        except Exception as e:
            logger.error(f"Error updating document {document.id}: {e}")
            raise e

    async def delete_document(self, document_id: str) -> bool:
        """Delete a document from the database."""
        try:
            # Get document first to get company_id for cache invalidation
            document = await self.get_document_by_id(document_id)
            company_id = document.company_id if document else None

            result = await self.db.documents.delete_one({"id": document_id})
            success = result.deleted_count > 0
            if success:
                logger.info(f"Deleted document {document_id}")
                # Invalidate meta-summary cache for this company when document is deleted
                if company_id:
                    try:
                        company = await company_service.get_company_by_id(company_id)
                        await company_service.invalidate_meta_summary_cache(company.slug)
                        logger.debug(f"Invalidated meta-summary cache for company {company.slug}")
                    except Exception as cache_error:
                        # Don't fail document deletion if cache invalidation fails
                        logger.warning(
                            f"Failed to invalidate cache for document {document_id}: {cache_error}"
                        )
            else:
                logger.warning(f"No document found with id {document_id} to delete")
            return bool(success)
        except Exception as e:
            logger.error(f"Error deleting document {document_id}: {e}")
            raise e

    async def get_documents_by_type(self, doc_type: str) -> list[Document]:
        """Get all documents of a specific type."""
        documents = await self.db.documents.find({"doc_type": doc_type}).to_list(length=None)
        return [Document(**document) for document in documents]

    async def get_documents_with_analysis(self, company_slug: str | None = None) -> list[Document]:
        """Get documents that have analysis data."""
        query: dict[str, Any] = {"analysis": {"$exists": True, "$ne": None}}
        if company_slug:
            query["company_slug"] = company_slug

        documents = await self.db.documents.find(query).to_list(length=None)
        return [Document(**document) for document in documents]

    async def update_document_analysis(self, document_id: str, analysis: DocumentAnalysis) -> bool:
        """Update the analysis for a specific document."""
        try:
            result = await self.db.documents.update_one(
                {"id": document_id},
                {"$set": {"analysis": analysis.model_dump(), "updated_at": datetime.now()}},
            )
            success = result.modified_count > 0
            if success:
                logger.info(f"Updated analysis for document {document_id}")
            return bool(success)
        except Exception as e:
            logger.error(f"Error updating analysis for document {document_id}: {e}")
            raise e


# Global instance
document_service = DocumentService()
