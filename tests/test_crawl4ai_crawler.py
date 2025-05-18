from src.crawl4ai_crawler import document_classification
from src.document import Document


def test_document_classification_privacy():
    # Test privacy policy classification
    documents = [
        Document(
            id="1",
            url="https://example.com/privacy-policy",
            doc_type="other",
            markdown="",
            metadata={},
            versions=[],
        )
    ]

    result = document_classification(documents)
    assert result[0].doc_type == "privacy"


def test_document_classification_terms():
    # Test terms of service classification
    documents = [
        Document(
            id="1",
            url="https://example.com/terms-of-service",
            doc_type="other",
            markdown="",
            metadata={},
            versions=[],
        )
    ]

    result = document_classification(documents)
    assert result[0].doc_type == "terms"


def test_document_classification_cookies():
    # Test cookie policy classification
    documents = [
        Document(
            id="1",
            url="https://example.com/cookie-policy",
            doc_type="other",
            markdown="",
            metadata={},
            versions=[],
        )
    ]

    result = document_classification(documents)
    assert result[0].doc_type == "cookies"


def test_document_classification_other():
    # Test other document classification
    documents = [
        Document(
            id="1",
            url="https://example.com/about",
            doc_type="other",
            markdown="",
            metadata={},
            versions=[],
        )
    ]

    result = document_classification(documents)
    assert result[0].doc_type == "other"


def test_document_classification_multiple_documents():
    # Test classification of multiple documents
    documents = [
        Document(
            id="1",
            url="https://example.com/privacy",
            doc_type="other",
            markdown="",
            metadata={},
            versions=[],
        ),
        Document(
            id="2",
            url="https://example.com/terms",
            doc_type="other",
            markdown="",
            metadata={},
            versions=[],
        ),
        Document(
            id="3",
            url="https://example.com/cookies",
            doc_type="other",
            markdown="",
            metadata={},
            versions=[],
        ),
        Document(
            id="4",
            url="https://example.com/about",
            doc_type="other",
            markdown="",
            metadata={},
            versions=[],
        ),
    ]

    result = document_classification(documents)
    assert result[0].doc_type == "privacy"
    assert result[1].doc_type == "terms"
    assert result[2].doc_type == "cookies"
    assert result[3].doc_type == "other"


def test_document_classification_case_insensitive():
    # Test case insensitivity of URL matching
    documents = [
        Document(
            id="1",
            url="https://example.com/PRIVACY",
            doc_type="other",
            markdown="",
            metadata={},
            versions=[],
        ),
        Document(
            id="2",
            url="https://example.com/Terms",
            doc_type="other",
            markdown="",
            metadata={},
            versions=[],
        ),
        Document(
            id="3",
            url="https://example.com/COOKIES",
            doc_type="other",
            markdown="",
            metadata={},
            versions=[],
        ),
    ]

    result = document_classification(documents)
    assert result[0].doc_type == "privacy"
    assert result[1].doc_type == "terms"
    assert result[2].doc_type == "cookies"
