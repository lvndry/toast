from fastapi import APIRouter

from src.crawl4ai_deep_crawl import crawl_documents_for_companies

router = APIRouter(prefix="/crawler")


@router.get("/crawl")
async def crawl():
    documents = await crawl_documents_for_companies()

    return {"documents": documents}
