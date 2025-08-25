from pydantic import BaseModel

from src.user import UserTier


class Company(BaseModel):
    id: str
    name: str
    description: str | None = None
    slug: str
    domains: list[str] = []
    categories: list[str] = []
    crawl_base_urls: list[str] = []
    logo: str | None = None
    visible_to_tiers: list[UserTier] = [UserTier.FREE, UserTier.BUSINESS, UserTier.ENTERPRISE]
