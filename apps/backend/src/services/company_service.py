from typing import List

from loguru import logger

from src.company import Company
from src.document import Document
from src.repositories import company_repository
from src.summarizer import generate_company_meta_summary


async def list_companies(has_documents: bool = True) -> List[Company]:
    companies = await company_repository.get_all_companies()
    if has_documents:
        filtered: List[Company] = []
        for company in companies:
            documents = await company_repository.get_company_documents(company.slug)
            if documents:
                filtered.append(company)
        return filtered
    return companies


async def get_company_by_slug(slug: str) -> Company:
    return await company_repository.get_company_by_slug(slug)


async def get_company_by_id(company_id: str) -> Company:
    return await company_repository.get_company_by_id(company_id)


async def get_sources(company_slug: str) -> dict:
    documents: List[Document] = await company_repository.get_company_documents(
        company_slug
    )
    return {
        "sources": [
            {"title": doc.title or "Untitled Document", "url": doc.url}
            for doc in documents
        ]
    }


async def get_or_generate_meta_summary(company_slug: str) -> dict:
    try:
        # Ensure company exists
        await company_repository.get_company_by_slug(company_slug)

        meta_summary = await company_repository.get_company_meta_summary(company_slug)
        if meta_summary is None:
            logger.info(f"Generating new meta summary for company {company_slug}")
            meta_summary = await generate_company_meta_summary(
                company_slug=company_slug
            )
            if meta_summary:
                await company_repository.store_company_meta_summary(
                    company_slug, meta_summary
                )
            else:
                raise ValueError(
                    f"Failed to generate meta summary for company {company_slug}"
                )

        return meta_summary.model_dump()
    except Exception:
        raise
