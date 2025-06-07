from pydantic import BaseModel


class Company(BaseModel):
    id: str
    name: str
    slug: str
    domains: list[str] = []
    categories: list[str] = []
    crawl_base_urls: list[str] = []
