from unittest.mock import AsyncMock, MagicMock

import pytest

from src.models.company import Company
from src.models.document import Document, DocumentAnalysis
from src.repositories.company_repository import CompanyRepository
from src.repositories.document_repository import DocumentRepository
from src.services.company_service import CompanyService


@pytest.fixture
def mock_db() -> MagicMock:
    db = MagicMock()
    # Mocking collections for legacy or direct access tests if any remain
    db.companies = AsyncMock()
    db.meta_summaries = AsyncMock()
    db.documents = MagicMock()
    db.documents.find_one = AsyncMock()
    db.documents.insert_one = AsyncMock()
    db.documents.update_one = AsyncMock()
    db.documents.delete_one = AsyncMock()
    db.documents.find = MagicMock()
    return db


@pytest.fixture
def mock_company_repo() -> MagicMock:
    return MagicMock(spec=CompanyRepository)


@pytest.fixture
def mock_document_repo() -> MagicMock:
    return MagicMock(spec=DocumentRepository)


@pytest.fixture
def company_service(mock_company_repo: MagicMock, mock_document_repo: MagicMock) -> CompanyService:
    return CompanyService(company_repo=mock_company_repo, document_repo=mock_document_repo)


@pytest.mark.asyncio
async def test_get_company_by_slug(
    company_service: CompanyService, mock_company_repo: MagicMock, mock_db: MagicMock
) -> None:
    mock_company = Company(
        id="123",
        name="Test Company",
        slug="test-company",
        domains=["test.com"],
        categories=["tech"],
        crawl_base_urls=["https://test.com"],
        logo=None,
        visible_to_tiers=["free", "business", "enterprise"],
    )
    mock_company_repo.find_by_slug.return_value = mock_company

    company = await company_service.get_company_by_slug(mock_db, "test-company")
    assert company is not None
    assert company.slug == "test-company"
    assert company.id == "123"
    mock_company_repo.find_by_slug.assert_called_once_with(mock_db, "test-company")


@pytest.mark.asyncio
async def test_get_company_overview(
    company_service: CompanyService, mock_company_repo: MagicMock, mock_db: MagicMock
) -> None:
    mock_company_repo.get_meta_summary.return_value = {
        "meta_summary": {
            "summary": "Test summary",
            "scores": {
                "transparency": {"score": 8, "justification": "Good"},
                "data_collection_scope": {"score": 5, "justification": "Medium"},
                "user_control": {"score": 7, "justification": "Okay"},
                "third_party_sharing": {"score": 3, "justification": "Bad"},
            },
            "risk_score": 5,
            "verdict": "moderate",
            "keypoints": ["Point 1"],
            "data_collected": ["Email"],
            "data_purposes": ["Ads"],
            "your_rights": ["Access"],
            "dangers": ["Tracking"],
            "benefits": ["Free"],
            "recommended_actions": ["Opt out"],
        }
    }
    mock_company_repo.find_by_slug.return_value = None
    mock_company_repo.get_document_counts.return_value = {"total": 1, "analyzed": 1}
    mock_company_repo.get_document_types.return_value = {"privacy_policy": 1}

    overview = await company_service.get_company_overview(mock_db, "test-company")
    assert overview is not None
    assert overview.company_slug == "test-company"
    assert overview.risk_score == 5
    mock_company_repo.get_meta_summary.assert_called_once_with(mock_db, "test-company")


@pytest.mark.asyncio
async def test_get_company_analysis(
    company_service: CompanyService,
    mock_company_repo: MagicMock,
    mock_document_repo: MagicMock,
    mock_db: MagicMock,
) -> None:
    # Mock meta summary
    mock_company_repo.get_meta_summary.return_value = {
        "meta_summary": {
            "summary": "Test summary",
            "scores": {
                "transparency": {"score": 8, "justification": "Good"},
                "data_collection_scope": {"score": 5, "justification": "Medium"},
                "user_control": {"score": 7, "justification": "Okay"},
                "third_party_sharing": {"score": 3, "justification": "Bad"},
            },
            "risk_score": 5,
            "verdict": "moderate",
            "keypoints": ["Point 1"],
        }
    }

    # Mock company
    mock_company = Company(
        id="123",
        name="Test Company",
        slug="test-company",
        domains=["test.com"],
        categories=["tech"],
        crawl_base_urls=["https://test.com"],
        visible_to_tiers=["free"],
    )
    mock_company_repo.find_by_slug.return_value = mock_company

    # Mock documents
    mock_doc = Document(
        id="doc1",
        title="Privacy Policy",
        doc_type="privacy_policy",
        url="https://test.com/privacy",
        company_id="123",
        markdown="# Privacy",
        text="Privacy",
        analysis=DocumentAnalysis(
            summary='{"summary": "CLEANED SUMMARY", "points": []}',  # Should be cleaned by validator
            scores={
                "transparency": {"score": 8, "justification": "Good"},
                "data_collection_scope": {"score": 5, "justification": "Medium"},
                "user_control": {"score": 7, "justification": "Okay"},
                "third_party_sharing": {"score": 3, "justification": "Bad"},
                "data_retention_score": {"score": 5, "justification": "Unknown"},
                "security_score": {"score": 9, "justification": "Strong"},
            },
            risk_score=5,
            verdict="moderate",
            keypoints=["Key Point"],
        ),
    )
    mock_document_repo.find_by_company_id.return_value = [mock_doc]

    analysis = await company_service.get_company_analysis(mock_db, "test-company")
    assert analysis is not None
    assert analysis.overview.company_slug == "test-company"
    assert len(analysis.documents) == 1
    assert analysis.documents[0].id == "doc1"
    assert analysis.documents[0].summary == "CLEANED SUMMARY"


@pytest.mark.asyncio
async def test_get_company_documents(
    company_service: CompanyService,
    mock_company_repo: MagicMock,
    mock_document_repo: MagicMock,
    mock_db: MagicMock,
) -> None:
    # Mock company
    mock_company = Company(
        id="123",
        name="Test Company",
        slug="test-company",
        domains=["test.com"],
        categories=["tech"],
        crawl_base_urls=["https://test.com"],
        visible_to_tiers=["free"],
    )
    mock_company_repo.find_by_slug.return_value = mock_company

    # Mock doc with JSON summary
    mock_doc = Document(
        id="doc1",
        title="Privacy Policy",
        doc_type="privacy_policy",
        url="https://test.com/privacy",
        company_id="123",
        markdown="# Privacy",
        text="Privacy",
        analysis=DocumentAnalysis(
            summary='{"summary": "JSON SUMMARY", "other": "data"}',
            scores={
                "transparency": {"score": 8, "justification": "Good"},
                "data_collection_scope": {"score": 5, "justification": "Medium"},
                "user_control": {"score": 7, "justification": "Okay"},
                "third_party_sharing": {"score": 3, "justification": "Bad"},
                "data_retention_score": {"score": 5, "justification": "Unknown"},
                "security_score": {"score": 9, "justification": "Strong"},
            },
            risk_score=5,
            verdict="moderate",
            keypoints=["Point A"],
        ),
    )
    mock_document_repo.find_by_company_id.return_value = [mock_doc]

    documents = await company_service.get_company_documents(mock_db, "test-company")
    assert len(documents) == 1
    assert documents[0].id == "doc1"
    assert documents[0].summary == "JSON SUMMARY"
    mock_document_repo.find_by_company_id.assert_called_once_with(mock_db, "123")
