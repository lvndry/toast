from datetime import datetime
from typing import Any, Literal

import shortuuid
from pydantic import BaseModel, Field


class DocumentAnalysisScores(BaseModel):
    score: int
    justification: str


class DocumentAnalysis(BaseModel):
    """
    Document analysis model.

    - summary: A user-oriented explanation of what this document means in practice.
    - scores: A dictionary with the following required keys (each value is a DocumentAnalysisScores object with score and justification):
        - transparency: A number between 0 and 10 indicating the transparency of the document.
        - data_collection_scope: A number between 0 and 10 indicating the scope of data collection.
        - user_control: A number between 0 and 10 indicating how much control users have over their data.
        - third_party_sharing: A number between 0 and 10 indicating third-party sharing practices.
    - risk_score: Overall risk score from 0-10 (calculated from component scores).
    - verdict: Overall verdict ("safe", "caution", "review", "avoid").
    - liability_risk: (Optional) Risk of liability exposure from contract terms (0-10, for business users).
    - compliance_status: (Optional) Compliance scores per regulation (e.g., {"GDPR": 8, "CCPA": 7}).
    - data_retention_score: (Optional) A number between 0 and 10 indicating data retention practices.
    - security_score: (Optional) A number between 0 and 10 indicating security practices.
    - keypoints: A list of bullet points capturing the most relevant and impactful ideas.
    """

    summary: str
    scores: dict[str, DocumentAnalysisScores]
    risk_score: int = Field(default=5, ge=0, le=10, description="Overall risk score from 0-10")
    verdict: Literal["safe", "caution", "review", "avoid"] = Field(
        default="caution", description="Overall verdict based on risk score"
    )
    liability_risk: int | None = Field(
        default=None, ge=0, le=10, description="Liability risk score (0-10, for business users)"
    )
    compliance_status: dict[str, int] | None = Field(
        default=None, description="Compliance scores per regulation (e.g., {'GDPR': 8, 'CCPA': 7})"
    )
    data_retention_score: int | None = Field(
        default=None, ge=0, le=10, description="Data retention practices score (0-10)"
    )
    security_score: int | None = Field(
        default=None, ge=0, le=10, description="Security practices score (0-10)"
    )
    keypoints: list[str] | None = None


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
    metadata: dict[str, Any]
    versions: list[dict[str, Any]] = []
    analysis: DocumentAnalysis | None = None
    locale: str | None = None
    regions: list[Region] = []
    effective_date: datetime | None = None
    created_at: datetime = Field(default_factory=datetime.now)
