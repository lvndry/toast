from typing import List

from src.db import get_all_documents as db_get_all_documents
from src.db import get_document_by_url as db_get_document_by_url
from src.db import update_document as db_update_document
from src.document import Document


async def get_all_documents() -> List[Document]:
    return await db_get_all_documents()


async def get_document_by_url(url: str) -> Document | None:
    return await db_get_document_by_url(url)


async def update_document(document: Document):
    return await db_update_document(document)
