from datetime import datetime
from typing import Literal

import shortuuid
from pydantic import BaseModel, Field


class DocumentAnalysisScores(BaseModel):
    score: int
    justification: str


class DocumentAnalysis(BaseModel):
    """
    Document analysis model.

    - summary: A user-oriented explanation of what this document means in practice.
    - scores: A dictionary with the following keys:
        - transparency: A number between 0 and 1 indicating the transparency of the document.
        - data_usage: A number between 0 and 1 indicating the amount of data used by the document.
    - keypoints: A list of bullet points capturing the most relevant and impactful ideas.
    """

    summary: str
    scores: dict[str, DocumentAnalysisScores]
    keypoints: list[str]


DocType = Literal[
    "privacy_policy",
    "terms_of_service",
    "cookie_policy",
    "terms_of_use",
    "terms_and_conditions",
    "data_processing_agreement",
    "gdpr_policy",
    "copyright_policy",
    "safety_policy",
    "other",
]

Region = Literal[
    "global",
    "US",
    "EU",
    "EFTA",
    "UK",
    "Asia",
    "Australia",
    "Canada",
    "Brazil",
    "South Korea",
    "Israel",
    "Other",
]


class Document(BaseModel):
    id: str = Field(default_factory=shortuuid.uuid)
    url: str
    title: str | None = None
    company_id: str
    doc_type: DocType
    markdown: str
    text: str
    metadata: dict
    versions: list[dict] = []
    analysis: DocumentAnalysis | None = None
    locale: str | None = None
    regions: list[Region] = []
    effective_date: datetime | None = None
    created_at: datetime = Field(default_factory=datetime.now)
