from typing import List

from src.company import Company
from src.db import get_all_companies as db_get_all_companies
from src.db import get_company_by_id as db_get_company_by_id
from src.db import get_company_by_slug as db_get_company_by_slug
from src.db import get_company_documents as db_get_company_documents
from src.db import get_company_meta_summary as db_get_company_meta_summary
from src.db import store_company_meta_summary as db_store_company_meta_summary
from src.document import Document, DocumentAnalysis


async def get_all_companies() -> List[Company]:
    return await db_get_all_companies()


async def get_company_by_id(company_id: str) -> Company:
    return await db_get_company_by_id(company_id)


async def get_company_by_slug(slug: str) -> Company:
    return await db_get_company_by_slug(slug)


async def get_company_documents(company_slug: str) -> List[Document]:
    return await db_get_company_documents(company_slug)


async def get_company_meta_summary(company_slug: str) -> DocumentAnalysis | None:
    return await db_get_company_meta_summary(company_slug)


async def store_company_meta_summary(company_slug: str, meta_summary: DocumentAnalysis):
    return await db_store_company_meta_summary(company_slug, meta_summary)
