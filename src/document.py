from datetime import datetime

import shortuuid
from pydantic import BaseModel, Field


class DocumentAnalysis(BaseModel):
    summary: str
    scores: dict[str, float]
    key_points: list[str]


class Document(BaseModel):
    id: str = Field(default_factory=shortuuid.uuid)
    url: str
    company_id: str
    doc_type: str
    markdown: str
    metadata: dict
    versions: list[dict] = []
    analysis: DocumentAnalysis | None = None
    created_at: datetime = Field(default_factory=datetime.now)
