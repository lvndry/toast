from typing import Union

from pydantic import BaseModel

from src.db import DATABASE_NAME, client


class Company(BaseModel):
    id: str
    name: str
    slug: str
    domains: list[str]
    crawl_base_urls: Union[list[str], None]
    categories: list[str]

    model_config = {
        "extra": "ignore"  # This will ignore any extra fields not defined in the model
    }


async def get_all_companies() -> list[Company]:
    db = client[DATABASE_NAME]
    companies: list[dict] = await db.companies.find().to_list(None)
    return [Company(**company) for company in companies]


async def get_company_by_id(id: str) -> Company:
    db = client[DATABASE_NAME]
    company = await db.companies.find_one({"id": id})
    if not company:
        raise ValueError("Company not found")
    return Company(**company)
