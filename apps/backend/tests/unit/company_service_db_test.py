from unittest.mock import AsyncMock, MagicMock

import pytest

from src.services.company_service import CompanyService


@pytest.fixture
def mock_db() -> MagicMock:
    db = MagicMock()
    db.companies = AsyncMock()
    db.meta_summaries = AsyncMock()
    db.documents = MagicMock()
    # find_one, insert_one, etc are async
    db.documents.find_one = AsyncMock()
    db.documents.insert_one = AsyncMock()
    db.documents.update_one = AsyncMock()
    db.documents.delete_one = AsyncMock()
    # find is synchronous and returns a cursor
    db.documents.find = MagicMock()
    return db


@pytest.fixture
def company_service(mock_db: MagicMock) -> CompanyService:
    service = CompanyService()
    service._db = mock_db
    return service


@pytest.mark.asyncio
async def test_get_company_by_slug(company_service: CompanyService, mock_db: MagicMock) -> None:
    mock_db.companies.find_one.return_value = {
        "id": "123",
        "name": "Test Company",
        "slug": "test-company",
        "domains": ["test.com"],
        "categories": ["tech"],
        "crawl_base_urls": ["https://test.com"],
        "logo": None,
        "visible_to_tiers": ["free", "business", "enterprise"],
    }

    company = await company_service.get_company_by_slug("test-company")
    assert company is not None
    assert company.slug == "test-company"
    assert company.id == "123"
    mock_db.companies.find_one.assert_called_once_with({"slug": "test-company"})


@pytest.mark.asyncio
async def test_get_company_overview(company_service: CompanyService, mock_db: MagicMock) -> None:
    mock_db.meta_summaries.find_one.return_value = {
        "summary": "Test summary",
        "scores": {
            "transparency": {"score": 8, "justification": "Good"},
            "data_collection_scope": {"score": 5, "justification": "Medium"},
            "user_control": {"score": 7, "justification": "Okay"},
            "third_party_sharing": {"score": 3, "justification": "Bad"},
            "data_retention_score": {"score": 5, "justification": "Unknown"},
            "security_score": {"score": 9, "justification": "Strong"},
        },
        "risk_score": 5,
        "verdict": "caution",
        "keypoints": ["Point 1"],
        "data_collected": ["Email"],
        "data_purposes": ["Ads"],
        "your_rights": ["Access"],
        "dangers": ["Tracking"],
        "benefits": ["Free"],
        "recommended_actions": ["Opt out"],
    }

    overview = await company_service.get_company_overview("test-company")
    assert overview is not None
    assert overview.company_slug == "test-company"
    assert overview.risk_score == 5
    mock_db.meta_summaries.find_one.assert_called_once_with({"company_slug": "test-company"})


@pytest.mark.asyncio
async def test_get_company_analysis(company_service: CompanyService, mock_db: MagicMock) -> None:
    # Mock meta summary
    mock_db.meta_summaries.find_one.return_value = {
        "summary": "Test summary",
        "scores": {
            "transparency": {"score": 8, "justification": "Good"},
            "data_collection_scope": {"score": 5, "justification": "Medium"},
            "user_control": {"score": 7, "justification": "Okay"},
            "third_party_sharing": {"score": 3, "justification": "Bad"},
            "data_retention_score": {"score": 5, "justification": "Unknown"},
            "security_score": {"score": 9, "justification": "Strong"},
        },
        "risk_score": 5,
        "verdict": "caution",
        "keypoints": ["Point 1"],
        "data_collected": ["Email"],
        "data_purposes": ["Ads"],
        "your_rights": ["Access"],
        "dangers": ["Tracking"],
        "benefits": ["Free"],
        "recommended_actions": ["Opt out"],
    }

    # Mock company
    mock_db.companies.find_one.return_value = {
        "id": "123",
        "name": "Test Company",
        "slug": "test-company",
        "domains": ["test.com"],
        "categories": ["tech"],
        "crawl_base_urls": ["https://test.com"],
        "logo": None,
        "visible_to_tiers": ["free", "business", "enterprise"],
    }

    # Mock documents
    mock_cursor = AsyncMock()
    mock_cursor.to_list.return_value = [
        {
            "id": "doc1",
            "title": "Privacy Policy",
            "doc_type": "privacy_policy",
            "url": "https://test.com/privacy",
            "last_updated": None,
            "verdict": "safe",
            "risk_score": 2,
            "top_concerns": [],
        }
    ]
    mock_db.documents.find.return_value = mock_cursor

    analysis = await company_service.get_company_analysis("test-company")
    assert analysis is not None
    assert analysis.overview.company_slug == "test-company"
    assert len(analysis.documents) == 1
    assert analysis.documents[0].id == "doc1"


@pytest.mark.asyncio
async def test_get_company_documents(company_service: CompanyService, mock_db: MagicMock) -> None:
    # Mock get_company_by_slug
    mock_db.companies.find_one.return_value = {
        "id": "123",
        "name": "Test Company",
        "slug": "test-company",
        "domains": ["test.com"],
        "categories": ["tech"],
        "crawl_base_urls": ["https://test.com"],
        "logo": None,
        "visible_to_tiers": ["free", "business", "enterprise"],
    }

    mock_cursor = AsyncMock()
    mock_cursor.to_list.return_value = [
        {
            "id": "doc1",
            "title": "Privacy Policy",
            "doc_type": "privacy_policy",
            "url": "https://test.com/privacy",
            "last_updated": None,
            "verdict": "safe",
            "risk_score": 2,
            "top_concerns": [],
        }
    ]
    mock_db.documents.find.return_value = mock_cursor

    documents = await company_service.get_company_documents("test-company")
    assert len(documents) == 1
    assert documents[0].id == "doc1"
    mock_db.documents.find.assert_called_once_with({"company_id": "123"})
