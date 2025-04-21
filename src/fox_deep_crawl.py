import os
from urllib.parse import urlparse, urlunparse
from fetchfox_sdk import FetchFox
from dotenv import load_dotenv
from loguru import logger
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

fetchfox_api_key = os.getenv("FETCHFOX_API_KEY")
fox = FetchFox(
    api_key=fetchfox_api_key, quiet=False, host="https://staging.fetchfox.ai"
)


def sanitize_url(url: str):
    parsed_url = urlparse(url)
    return urlunparse(parsed_url._replace(query=""))


def get_urls(urls: list[str], goal: str):
    items = fox.init(urls).extract(
        {
            "url": f"URL of a page on this domain that is topically relevant to '{goal}' (prioritize authoritative or highly related pages)",
            "title": "Title of the page",
            "description": "Description of the page",
            "rating": f"Relevance score (0-100) estimating how closely this page aligns with '{goal}' (100 = perfect match, 0 = irrelevant)",
            "language": "Language of the page. ISO 639-1 language code.",
            "created_at": "Exact publication date and time of this page in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ), or closest available timestamp",
            "last_updated": "Most recent modification date and time in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ), including minor content updates",
        }
    )

    results: list[dict] = []

    for item in items:
        logger.info(item)
        if item.rating != "(not found)" and item.url != "(not found)":
            try:
                rating = int(item.rating)
                if rating >= 80:
                    results.append(
                        {
                            "rating": rating,
                            "url": sanitize_url(item.url),
                            "created_at": item.created_at,
                            "last_updated": item.last_updated,
                        }
                    )
                else:
                    logger.warning(
                        f"skipping {item.url} because rating is {item.rating}"
                    )
            except (ValueError, TypeError) as e:
                logger.error(e)
        else:
            logger.warning(f"skipping {item.url} because url or rating was not found")
    return results


def deep_crawl(urls: list[str], goal: str, iterations: int):
    all_items: list[dict] = []
    current: list[str] = urls

    for i in range(iterations):
        logger.debug(f"iteration {i}")
        items = get_urls(current, goal)
        all_items += items
        current = list(set(item["url"].strip() for item in items))

    seen_urls: dict[str, dict] = {}
    for item in all_items:
        item["url"] = item["url"].rstrip("/")
        url = item["url"]
        if url not in seen_urls or item["rating"] > seen_urls[url]["rating"]:
            seen_urls[url] = item
    return list(seen_urls.values())


async def get_company_id(company_id: str):
    client: AsyncIOMotorClient = AsyncIOMotorClient(os.getenv("MONGO_URI"))
    db = client["toast"]
    collection = db["companies"]
    company = await collection.find_one({"id": company_id})
    return company


async def insert_into_mongo(company_id: str, items: list[dict]):
    client: AsyncIOMotorClient = AsyncIOMotorClient(os.getenv("MONGO_URI"))
    db = client["toast"]
    collection = db["documents"]
    company = await get_company_id(company_id)
    company["sources"] = items
    await collection.update_one({"id": company_id}, {"$set": company}, upsert=True)


def main():
    urls = [
        # "https://www.facebook.com/legal/",
        "https://policies.google.com/",
        "https://safety.google/",
    ]

    goal = """
legal documents including:
- Privacy policies (GDPR, CCPA, LGPD, PIPEDA)
- Terms of service
- Use agreements
- Cookie policies and consent management
- Data processing agreements (DPAs)
- Data protection addendums
- Copyright/DMCA notices
- Accessibility statements
- Refund/return policies
- End User License Agreements (EULAs)
- Legal disclaimers
- Safety policies
- FAQ
"""

    items = fox.crawl(
        ["https://www.facebook.com/legal/*", "https://www.facebook.com/privacy/*"],
        pull=True,
        query=goal,
    )

    for item in items:
        insert_into_mongo("facebook", item)


main()
