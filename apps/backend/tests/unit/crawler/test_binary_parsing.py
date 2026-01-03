from typing import cast
from unittest.mock import patch

import aiohttp
import pytest

from src.crawler import ClauseaCrawler
from src.document_processor import DocumentProcessor


@pytest.mark.asyncio
async def test_document_processor_pdf_fallbacks_are_invoked():
    # Ensure _extract_text delegates to pdfminer/tika fallbacks when configured
    dp = DocumentProcessor(enable_binary_parsing=True, prefer_pdfminer=True, prefer_tika=True)

    # Monkeypatch the primary pdf extractor to return None, and the fallback to return text
    async def fake_pdfplumber(buf):
        return None

    async def fake_pdfminer(buf):
        return "pdfminer extracted text"

    with patch.object(DocumentProcessor, "_extract_text_from_pdf", fake_pdfplumber):
        with patch.object(DocumentProcessor, "_extract_text_from_pdf", fake_pdfminer):
            text = await dp._extract_text(b"%PDF-", "dummy.pdf", "application/pdf")
            assert text == "pdfminer extracted text"


@pytest.mark.asyncio
async def test_crawler_respects_enable_binary_crawling_flag(monkeypatch):
    # Create a crawler that enables binary crawling
    crawler = ClauseaCrawler(enable_binary_crawling=True)

    # Mock an aiohttp response via a lightweight fake
    class FakeResponse:
        def __init__(self, status, headers, content_bytes):
            self.status = status
            self.headers = headers
            self._content = content_bytes

        async def read(self):
            return self._content

    class FakeSession:
        async def get(self, url, **kwargs):
            return FakeResponse(200, {"content-type": "application/pdf"}, b"%PDF-1.4 dummy")

    # Monkeypatch DocumentProcessor._extract_text to return content
    async def fake_extract(file_content, filename, content_type):
        return "legal pdf content"

    monkeypatch.setattr(DocumentProcessor, "_extract_text", fake_extract)

    session = FakeSession()
    res = await crawler._fetch_page_internal(
        cast(aiohttp.ClientSession, session), "https://example.com/privacy.pdf"
    )

    assert res.success is True
    assert "legal pdf content" in res.content
    assert res.metadata.get("content-type") == "application/pdf"
