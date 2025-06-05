from datetime import datetime
from typing import Literal

import shortuuid
from pydantic import BaseModel, Field


class DocumentAnalysis(BaseModel):
    summary: str
    scores: dict[str, float]
    key_points: list[str]


DocType = Literal[
    "privacy_policy",
    "terms_of_service",
    "cookie_policy",
    "terms_and_conditions",
    "data_processing_agreement",
    "gdpr_policy",
    "copyright_policy",
    "other",
]


class Document(BaseModel):
    id: str = Field(default_factory=shortuuid.uuid)
    url: str
    company_id: str
    doc_type: DocType
    is_legal_document: bool = False
    markdown: str
    text: str
    metadata: dict
    versions: list[dict] = []
    analysis: DocumentAnalysis | None = None
    locale: str | None = None
    created_at: datetime = Field(default_factory=datetime.now)
