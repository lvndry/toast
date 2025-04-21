from enum import Enum
from datetime import datetime
from typing import Optional


class DocumentType(Enum):
    TERMS = "Terms of Service"
    PRIVACY = "Privacy Policy"
    COOKIES = "Cookie Policy"
    EULA = "End User License Agreement"
    COMMUNITY = "Community Guidelines"


class ScrapedDocument:
    def __init__(
        self,
        url: str,
        raw_text: str,
        cleaned_text: str,
        html_content: str,
        document_type: DocumentType,
        crawl_date: datetime,
        company_name: Optional[str] = None,
        id: Optional[str] = None,
    ):
        self.url = url
        self.raw_text = raw_text
        self.cleaned_text = cleaned_text
        self.html_content = html_content
        self.document_type = document_type
        self.crawl_date = crawl_date
        self.company_name = company_name
        self.id = id
