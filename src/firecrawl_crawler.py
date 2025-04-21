import asyncio
import os
from typing import Optional, Dict, Any, List
from firecrawl import FirecrawlApp
from loguru import logger
from motor.motor_asyncio import AsyncIOMotorClient
from fetchfox_sdk import FetchFox

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "toast"
FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY")

# Create MongoDB client
client: AsyncIOMotorClient = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]


async def get_company_record(company_name: str) -> Optional[Dict[str, Any]]:
    """Retrieve company ID from database"""
    company = await db.companies.find_one({"slug": company_name.lower()})
    return company


async def get_company_base_sources(company_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve company base sources from database"""
    document = await db.documents.find_one({"company_id": company_id})
    return document


async def map_urls(base_urls: List[str]) -> List[str]:
    """Crawl sub-urls for company's base sources"""
    app = FirecrawlApp(api_key=FIRECRAWL_API_KEY)

    for base_url in base_urls:
        base_url = f"{base_url}/" if not base_url.endswith("/") else base_url

        try:
            logger.info(f"🔍 Crawling {base_url}")
            crawl_result = app.map_url(
                url=base_url,
            )

            logger.info(crawl_result)

            return crawl_result["links"]
        except Exception as e:
            logger.error(e)
            logger.error(f"❌ Failed to crawl {base_url}: {str(e)}")

    return []


async def store_mapped_urls(company_id: str, urls: List[str]):
    """Update documents with sources field where company_id matches"""
    try:
        result = await db.documents.update_one(
            {"company_id": company_id}, {"$set": {"sources": urls}}
        )

        if result.matched_count == 0:
            logger.warning(f"No document found with company_id: {company_id}")
    except Exception as e:
        logger.error(e)
        logger.error(f"❌ Failed to update documents with sources: {str(e)}")


# unused
async def scrape_page_content(url: str) -> Optional[Dict[str, Any]]:
    app = FirecrawlApp(api_key=FIRECRAWL_API_KEY)
    crawl_result = app.scrape_url(url=url)
    logger.info(crawl_result)
    return crawl_result


async def main(company_name: str):
    company = await get_company_record(company_name)

    if not company:
        logger.error(f"Company {company_name} not in database")
        return

    logger.info(company)
    company_id = str(company["id"])

    document = await get_company_base_sources(company_id)

    if not document or "base_sources" not in document:
        logger.error(f"Company {company_name} has no sources")
        return

    if "sources" not in document:
        logger.info(f"Starting crawl for {company_name} (ID: {company_id})")
        # mapped_urls = await map_urls(base_urls=document["base_sources"])
        # logger.info(mapped_urls)
        # classifier = WebpageClassifier(firecrawl_api_key=FIRECRAWL_API_KEY)
        # legal_documents: List[str] = [{}
        FOX_API_KEY = os.getenv("FOX_API_KEY")
        fox = FetchFox(api_key=FOX_API_KEY)
        items = fox.extract(
            "https://www.facebook.com/legal/wifi_terms",
            {
                "content": "Page content",
                "published_at": "Date of publication",
                "updated_at": "Last update date",
                "content_type": "terms_of_service or cookie_policy or legal_document or other",
            },
        )

        for item in items:
            print(item)


#
# for url in mapped_urls:
#     classification = await classifier.classify_page(url=url)
#     logger.info(classification)
#     if classification["classification"] in [
#         "legal_document",
#         "privacy_policy",
#         "terms_of_service",
#         "cookie_policy",
#     ]:
#         legal_documents.append(url)

# logger.info(f"Legal document found: {legal_documents}")

# document["sources"] = mapped_urls
# await store_mapped_urls(company_id=company_id, urls=document["sources"])

# for url in document["sources"]:
#     page_content = await scrape_page_content(url=url)
#     logger.info(page_content)


if __name__ == "__main__":
    import sys

    if len(sys.argv) != 2:
        print("Usage: python crawler.py <company_name>")
        sys.exit(1)

    asyncio.run(main(sys.argv[1].strip().lower()))


def is_legal_document(page: Dict[str, Any]) -> bool:
    """Enhanced document detection"""
    content = (page.get("markdown") or "").lower()
    return any(
        keyword in content[:2000]
        for keyword in [
            "privacy policy",
            "terms of service",
            "data collection",
            "cookie policy",
            "user agreement",
        ]
    )


def infer_document_type(url: str) -> str:
    """Improved type inference"""
    url = url.lower()
    if any(kw in url for kw in ["privacy", "data-protection"]):
        return "privacy"
    if any(kw in url for kw in ["terms", "conditions", "tos"]):
        return "terms"
    if any(kw in url for kw in ["cookie", "tracking"]):
        return "cookies"
    return "other"
