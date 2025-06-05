from pydantic import BaseModel


class Company(BaseModel):
    id: str
    name: str
    slug: str
    domains: list[str] = []
    categories: list[str] = []
    crawl_base_urls: list[str] = []

    model_config = {
        "extra": "ignore"  # This will ignore any extra fields not defined in the model
    }
