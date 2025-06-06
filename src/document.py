from datetime import datetime
from typing import Literal

import shortuuid
from pydantic import BaseModel, Field


class DocumentAnalysis(BaseModel):
    """
    Document analysis model.

    - summary: A user-oriented explanation of what this document means in practice.
    - scores: A dictionary with the following keys:
        - transparency: A number between 0 and 1 indicating the transparency of the document.
        - data_usage: A number between 0 and 1 indicating the amount of data used by the document.
    - key_points: A list of bullet points capturing the most relevant and impactful ideas.
    """

    summary: str
    scores: dict[str, float]
    key_points: list[str]


DocType = Literal[
    "privacy_policy",
    "terms_of_service",
    "cookie_policy",
    "terms_of_use",
    "data_processing_agreement",
    "gdpr_policy",
    "copyright_policy",
    "other",
]


class Document(BaseModel):
    id: str = Field(default_factory=shortuuid.uuid)
    url: str
    title: str | None = None
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

    def to_db(self) -> dict:
        """Convert Document to dictionary for database storage, excluding computed fields."""
        data = self.model_dump()
        # Remove is_legal_document as it's a computed field
        data.pop("is_legal_document", None)
        return data

    @classmethod
    def from_db(cls, data: dict) -> "Document":
        """Create Document instance from database data, adding computed fields."""
        data["is_legal_document"] = True
        return cls(**data)
