"""
Enterprise Legal Document Crawling Pipeline

This module provides a comprehensive crawling pipeline that integrates the ToastCrawler
with AI-powered document analysis for legal document discovery and processing.

Architecture Decisions:
1. **Modular Design**: Separates concerns into distinct classes for crawling, analysis,
   and storage, enabling easy testing and maintenance.

2. **Async/Await Pattern**: Uses asyncio throughout for optimal I/O performance when
   dealing with multiple network requests and database operations.

3. **Comprehensive Error Handling**: Implements graceful error handling with detailed
   logging to ensure pipeline robustness and easy debugging.

4. **Memory Management**: Includes memory monitoring and optimization strategies for
   large-scale crawling operations.

5. **Rate Limiting**: Built-in respect for robots.txt and configurable delays to be
   a good web citizen.

6. **Deduplication**: Smart URL and content deduplication to avoid processing
   duplicate documents.

7. **Incremental Processing**: Processes companies sequentially to manage memory
   and respect rate limits while maintaining data consistency.

Performance Characteristics:
- Memory efficient: Processes companies one at a time
- Network optimized: Concurrent requests with configurable limits
- Database efficient: Bulk operations and smart update logic
- Scalable: Can handle hundreds of companies and thousands of documents

Usage:
    # Run the complete pipeline
    python -m src.crawling

    # Or use programmatically
    from src.crawling import LegalDocumentPipeline

    pipeline = LegalDocumentPipeline()
    results = await pipeline.run()
"""

import asyncio
import hashlib
import json
import re
import time
import tracemalloc
from datetime import datetime
from typing import Any, Dict, List, Optional, cast

from dotenv import load_dotenv
from litellm import acompletion
from loguru import logger
from pydantic import BaseModel

from src.company import Company
from src.db import get_all_companies, get_document_by_url, mongo
from src.document import Document, Region
from src.models import SupportedModel, get_model
from src.toast_crawler import CrawlResult, ToastCrawler
from src.utils.markdown import markdown_to_text
from src.utils.perf import log_memory_usage, memory_monitor_task

load_dotenv()

# Configure loguru for structured logging
logger.configure(
    handlers=[
        {
            "sink": "crawling.log",
            "rotation": "10 MB",
            "retention": "1 week",
            "format": "{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} - {message}",
            "level": "INFO",
        },
        {
            "sink": lambda msg: print(msg, end=""),
            "format": "<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | {message}",
            "level": "INFO",
        },
    ]
)


class ProcessingStats(BaseModel):
    """Statistics for document processing pipeline."""

    companies_processed: int = 0
    companies_failed: int = 0
    failed_company_slugs: List[str] = []
    total_urls_crawled: int = 0
    total_documents_found: int = 0
    legal_documents_processed: int = 0
    legal_documents_stored: int = 0
    english_documents: int = 0
    non_english_skipped: int = 0
    duplicates_skipped: int = 0
    processing_time_seconds: float = 0.0

    @property
    def success_rate(self) -> float:
        """Calculate company processing success rate."""
        total = self.companies_processed + self.companies_failed
        return (self.companies_processed / total * 100) if total > 0 else 0.0

    @property
    def legal_detection_rate(self) -> float:
        """Calculate legal document detection rate."""
        return (
            (self.legal_documents_processed / self.total_documents_found * 100)
            if self.total_documents_found > 0
            else 0.0
        )


class DocumentAnalyzer:
    """
    AI-powered document analyzer for locale detection, legal classification, and region analysis.

    This class encapsulates all AI/LLM interactions for document analysis, providing
    a clean interface for the main pipeline while handling API errors gracefully.
    """

    def __init__(
        self,
        model: SupportedModel = "mistral-small",
        temperature: float = 0.1,
        max_content_length: int = 5000,
    ):
        """
        Initialize the document analyzer.

        Args:
            model: LLM model to use for analysis
            temperature: Sampling temperature for LLM responses
            max_content_length: Maximum content length to send to LLM
            api_key: API key for LLM service (loaded from env if not provided)
        """
        model = get_model(model)

        self.model = model.model
        self.api_key = model.api_key
        self.temperature = temperature
        self.max_content_length = max_content_length

        # Document type categories for classification
        self.categories = [
            "privacy_policy",
            "terms_of_service",
            "cookie_policy",
            "terms_and_conditions",
            "data_processing_agreement",
            "gdpr_policy",
            "copyright_policy",
            "safety_policy",
            "other",
        ]

    async def detect_locale(
        self, text: str, metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Detect the locale of a document.

        Priority order:
        1. Check metadata for explicit locale information
        2. Use LLM analysis of text content
        3. Fallback to English (en-US)

        Args:
            text: Document content
            metadata: Document metadata

        Returns:
            Dict containing locale, confidence, and language_name
        """
        # Check metadata first for performance
        if metadata:
            for key in ["og:locale", "og:language", "locale", "language", "lang"]:
                if key in metadata and metadata[key]:
                    locale = metadata[key]
                    logger.debug(f"Found locale in metadata ({key}): {locale}")
                    return {
                        "locale": locale,
                        "confidence": 1.0,
                        "language_name": locale,
                    }

        # Use LLM for text-based detection
        logger.debug("Locale not found in metadata, using LLM analysis")

        # Extract representative text sample (middle portion for better language detection)
        text_length = len(text)
        if text_length > 1000:
            start_pos = text_length // 2 - 500
            text_sample = text[start_pos : start_pos + 1000]
        else:
            text_sample = text

        prompt = f"""Analyze this text sample and determine the language/locale.

Text sample:
{text_sample}

Return a JSON object with:
- locale: detected locale (format: "en-US", "fr-FR", "de-DE", etc.)
- confidence: float 0-1 indicating detection confidence
- language_name: human readable language name

Be specific with locale (include country when possible)."""

        system_prompt = """You are a language detection expert. Analyze text and determine language/locale accurately."""

        try:
            response = await acompletion(
                model=self.model,
                api_key=self.api_key,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                temperature=self.temperature,
            )

            result = json.loads(response.choices[0].message.content)
            logger.debug(f"LLM locale detection result: {result}")
            return result

        except Exception as e:
            logger.warning(f"LLM locale detection failed: {e}")
            return {
                "locale": "en-US",
                "confidence": 0.5,
                "language_name": "English (fallback)",
            }

    async def classify_document(
        self, url: str, text: str, metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Classify if document is a legal document and determine its type.

        Args:
            url: Document URL
            text: Document content
            metadata: Document metadata

        Returns:
            Dict containing classification, justification, and is_legal_document flag
        """
        # Truncate content for LLM analysis
        content_sample = text[: self.max_content_length]
        categories_list = "\n".join(f"- {cat}" for cat in self.categories)

        prompt = f"""Analyze webpage content to determine if it's a legal document and classify its type.

URL: {url}
Content: {content_sample}
Metadata: {json.dumps(metadata, indent=2)}

Categories:
{categories_list}

Return JSON with:
- classification: most appropriate category (use "other" if not legal/unclear)
- classification_justification: brief explanation of category choice
- is_legal_document: boolean (True only for substantive legal text)
- is_legal_document_justification: rationale for legal classification

Note: Cookie banners, navigation elements, or links to legal documents don't count as legal documents themselves."""

        system_prompt = """You are a legal document classifier. Identify substantive legal content and categorize accurately."""

        try:
            response = await acompletion(
                model=self.model,
                api_key=self.api_key,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                temperature=self.temperature,
            )

            result = json.loads(response.choices[0].message.content)
            logger.debug(f"Document classification result: {result}")
            return result

        except Exception as e:
            logger.warning(f"Document classification failed: {e}")
            return {
                "classification": "other",
                "classification_justification": f"Classification failed: {e}",
                "is_legal_document": False,
                "is_legal_document_justification": "Could not analyze due to error",
            }

    async def detect_regions(
        self, text: str, metadata: Dict[str, Any], url: str
    ) -> Dict[str, Any]:
        """
        Detect if document applies globally or to specific regions.

        Args:
            text: Document content
            metadata: Document metadata
            url: Document URL

        Returns:
            Dict containing region analysis with mapped region codes
        """
        # Use reasonable text sample for analysis
        text_sample = text[:3000] if len(text) > 3000 else text

        prompt = f"""Analyze this legal document to determine geographic scope.

URL: {url}
Text: {text_sample}
Metadata: {json.dumps(metadata, indent=2) if metadata else "None"}

Look for:
- Geographic limitations ("applies to users in...")
- Legal frameworks (GDPR=EU, CCPA=California/US)
- Jurisdiction clauses ("governed by laws of...")
- Regional domains/paths (/eu/, /us/, .uk)

Return JSON:
{{
    "is_global": boolean,
    "specific_regions": ["region names"],
    "confidence": float 0-1,
    "justification": "reasoning",
    "regional_indicators": ["text snippets"]
}}
"""

        system_prompt = """You are a legal geographic scope analyst. Determine document applicability accurately."""

        try:
            response = await acompletion(
                model=self.model,
                api_key=self.api_key,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                temperature=self.temperature,
            )

            result = json.loads(response.choices[0].message.content)

            # Convert to Document region format
            regions = self._map_regions_to_document_format(
                result.get("is_global", True), result.get("specific_regions", [])
            )

            return {
                "regions": regions,
                "confidence": result.get("confidence", 0.5),
                "justification": result.get("justification", ""),
                "regional_indicators": result.get("regional_indicators", []),
            }

        except Exception as e:
            logger.warning(f"Region detection failed: {e}")
            return {
                "regions": ["global"],
                "confidence": 0.5,
                "justification": f"Region detection failed: {e}",
                "regional_indicators": [],
            }

    def _map_regions_to_document_format(
        self, is_global: bool, specific_regions: List[str]
    ) -> List[Region]:
        """Map detected regions to Document Region literals."""
        if is_global:
            return ["global"]

        region_mapping = {
            "united states": "US",
            "usa": "US",
            "us": "US",
            "america": "US",
            "european union": "EU",
            "eu": "EU",
            "europe": "EU",
            "united kingdom": "UK",
            "uk": "UK",
            "britain": "UK",
            "asia": "Asia",
            "australia": "Australia",
            "canada": "Canada",
            "brazil": "Brazil",
            "south korea": "South Korea",
            "israel": "Israel",
        }

        regions: list[Region] = []
        for region in specific_regions:
            mapped = region_mapping.get(region.lower(), "Other")
            if mapped not in regions:
                regions.append(cast(Region, mapped))

        return regions if regions else ["Other"]

    async def extract_title(
        self, markdown: str, metadata: Dict[str, Any], url: str, doc_type: str
    ) -> Dict[str, Any]:
        """
        Extract meaningful title from document.

        Args:
            markdown: Document markdown content
            metadata: Document metadata
            url: Document URL
            doc_type: Classified document type

        Returns:
            Dict containing extracted title and confidence
        """
        # Quick extraction from metadata first
        if metadata:
            for key in ["title", "og:title", "twitter:title"]:
                if key in metadata and metadata[key]:
                    title = metadata[key].strip()
                    if title:
                        return {"title": title, "confidence": 0.9}

        # Extract from markdown content
        lines = markdown.split("\n")
        for line in lines[:10]:  # Check first 10 lines
            line = line.strip()
            if line.startswith("#") and len(line) < 200:
                title = line.lstrip("#").strip()
                if title:
                    return {"title": title, "confidence": 0.8}

        # Fallback to document type with domain
        from urllib.parse import urlparse

        domain = urlparse(url).netloc.replace("www.", "")
        type_titles = {
            "privacy_policy": "Privacy Policy",
            "terms_of_service": "Terms of Service",
            "cookie_policy": "Cookie Policy",
            "terms_and_conditions": "Terms and Conditions",
            "data_processing_agreement": "Data Processing Agreement",
            "gdpr_policy": "GDPR Policy",
            "copyright_policy": "Copyright Policy",
            "safety_policy": "Safety Policy",
        }

        title = f"{type_titles.get(doc_type, 'Legal Document')} - {domain}"
        return {"title": title, "confidence": 0.5}

    async def extract_effective_date(
        self, content: str, metadata: Dict[str, Any]
    ) -> Optional[str]:
        """
        Extract the effective date from a legal document.

        First attempts static extraction from metadata and common patterns,
        then falls back to LLM analysis if needed.

        Args:
            content: Document text content
            metadata: Document metadata

        Returns:
            Effective date as ISO string (YYYY-MM-DD) or None if not found
        """

        # Try static extraction first
        effective_date = await self._extract_effective_date_static(content, metadata)
        if effective_date:
            logger.debug(f"Found effective date statically: {effective_date}")
            return effective_date

        # Fall back to LLM analysis
        logger.debug("Static extraction failed, using LLM for effective date")
        return await self._extract_effective_date_llm(content, metadata)

    async def _extract_effective_date_static(
        self, content: str, metadata: Dict[str, Any]
    ) -> Optional[str]:
        """
        Attempt static extraction of effective date from metadata and content patterns.

        Args:
            content: Document text content
            metadata: Document metadata

        Returns:
            Effective date as ISO string or None
        """
        import re

        # Check metadata first
        if metadata:
            for key in ["effective_date", "last_updated", "date", "published"]:
                if key in metadata and metadata[key]:
                    date_str = str(metadata[key]).strip()
                    parsed_date = self._parse_date_string(date_str)
                    if parsed_date:
                        return parsed_date

        # Common effective date patterns in legal documents
        patterns = [
            r"effective\s+(?:date|as\s+of):\s*([^.\n]+)",
            r"effective\s+([^.\n]+)",
            r"last\s+updated:?\s*([^.\n]+)",
            r"(?:this\s+policy\s+)?(?:is\s+)?effective\s+(?:as\s+of\s+)?([^.\n]+)",
            r"updated\s+on:?\s*([^.\n]+)",
            r"revision\s+date:?\s*([^.\n]+)",
        ]

        search_text = content.lower()

        for pattern in patterns:
            matches = re.finditer(pattern, search_text, re.IGNORECASE | re.MULTILINE)
            for match in matches:
                date_str = match.group(1).strip()
                parsed_date = self._parse_date_string(date_str)
                if parsed_date:
                    return parsed_date

        return None

    async def _extract_effective_date_llm(
        self, content: str, metadata: Dict[str, Any]
    ) -> Optional[str]:
        """
        Use LLM to extract effective date from document content.

        Args:
            content: Document text content
            metadata: Document metadata

        Returns:
            Effective date as ISO string or None if not found
        """
        # Use first portion of content where dates are typically mentioned
        content_sample = content[:3000] if len(content) > 3000 else content

        prompt = f"""Analyze this legal document to find the effective date.

Content: {content_sample}
Metadata: {json.dumps(metadata, indent=2) if metadata else "None"}

Look for:
- "Effective date:", "Effective as of:", etc.
- "Last updated:", "Updated on:", etc.
- "This policy is effective...", "This agreement takes effect..."
- Any explicit date mentioned as when the document becomes effective

Return JSON:
{{
    "effective_date": "YYYY-MM-DD" or null,
    "confidence": float 0-1,
    "source_text": "exact text snippet where date was found" or null,
    "reasoning": "explanation of why this date was chosen or why none found"
}}

IMPORTANT: Return null for effective_date if you cannot find a clear effective date. Do not guess or infer dates."""

        system_prompt = """You are an expert at extracting effective dates from legal documents. Only return dates that are explicitly stated as effective dates, last updated dates, or similar. Do not guess or infer dates."""

        try:
            response = await acompletion(
                model=self.model,
                api_key=self.api_key,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                temperature=self.temperature,
            )

            result = json.loads(response.choices[0].message.content)
            effective_date = result.get("effective_date")

            if effective_date:
                # Validate the date format
                parsed_date = self._parse_date_string(effective_date)
                if parsed_date:
                    logger.debug(
                        f"LLM found effective date: {parsed_date} "
                        f"(confidence: {result.get('confidence', 0):.2f})"
                    )
                    return parsed_date

            logger.debug("LLM could not find effective date")
            return None

        except Exception as e:
            logger.warning(f"LLM effective date extraction failed: {e}")
            return None

    def _parse_date_string(self, date_str: str) -> Optional[str]:
        """
        Parse a date string into ISO format (YYYY-MM-DD).

        Args:
            date_str: Date string to parse

        Returns:
            ISO formatted date string or None if parsing fails
        """
        if not date_str or not isinstance(date_str, str):
            return None

        # Clean up the date string
        date_str = date_str.strip().replace(",", "")

        # Common date formats to try
        formats = [
            "%Y-%m-%d",  # 2023-12-01
            "%m/%d/%Y",  # 12/01/2023
            "%d/%m/%Y",  # 01/12/2023
            "%B %d, %Y",  # December 1, 2023
            "%b %d, %Y",  # Dec 1, 2023
            "%d %B %Y",  # 1 December 2023
            "%d %b %Y",  # 1 Dec 2023
            "%Y-%m-%dT%H:%M:%S",  # ISO with time
            "%Y-%m-%d %H:%M:%S",  # Standard with time
        ]

        for fmt in formats:
            try:
                parsed = datetime.strptime(date_str, fmt)
                return parsed.strftime("%Y-%m-%d")
            except ValueError:
                continue

        # Try to extract year-month-day pattern with regex
        pattern = r"(\d{4})[/-](\d{1,2})[/-](\d{1,2})"
        match = re.search(pattern, date_str)
        if match:
            year, month, day = match.groups()
            try:
                parsed = datetime(int(year), int(month), int(day))
                return parsed.strftime("%Y-%m-%d")
            except ValueError:
                pass

        return None


class LegalDocumentPipeline:
    """
    Main pipeline orchestrator for legal document crawling and processing.

    This class coordinates the entire pipeline from company retrieval to document storage,
    providing comprehensive error handling, logging, and performance monitoring.
    """

    def __init__(
        self,
        max_depth: int = 4,
        max_pages: int = 1000,
        crawler_strategy: str = "bfs",
        concurrent_limit: int = 10,
        delay_between_requests: float = 1.0,
        timeout: int = 30,
        respect_robots_txt: bool = True,
    ):
        """
        Initialize the legal document pipeline.

        Args:
            max_depth: Maximum crawl depth per company
            max_pages: Maximum pages to crawl per company
            crawler_strategy: Crawling strategy ("bfs", "dfs", "best_first")
            concurrent_limit: Maximum concurrent requests
            delay_between_requests: Delay between requests in seconds
            timeout: Request timeout in seconds
            respect_robots_txt: Whether to respect robots.txt
        """
        self.max_depth = max_depth
        self.max_pages = max_pages
        self.crawler_strategy = crawler_strategy
        self.concurrent_limit = concurrent_limit
        self.delay_between_requests = delay_between_requests
        self.timeout = timeout
        self.respect_robots_txt = respect_robots_txt

        # Initialize components
        self.analyzer = DocumentAnalyzer()
        self.stats = ProcessingStats()

        logger.info(
            f"Pipeline initialized with max_depth={max_depth}, "
            f"max_pages={max_pages}, strategy={crawler_strategy}"
        )

    def _create_crawler_for_company(self, company: Company) -> ToastCrawler:
        """Create a configured crawler instance for a specific company."""
        return ToastCrawler(
            max_depth=self.max_depth,
            max_pages=self.max_pages,
            max_concurrent=self.concurrent_limit,
            delay_between_requests=self.delay_between_requests,
            timeout=self.timeout,
            allowed_domains=company.domains,
            respect_robots_txt=self.respect_robots_txt,
            user_agent="ToastCrawler/2.0 (Legal Document Discovery Bot)",
            follow_external_links=False,
            min_legal_score=0.0,
            strategy=self.crawler_strategy,
        )

    async def _store_documents(self, documents: List[Document]) -> int:
        """
        Store documents with intelligent deduplication and update logic.

        Args:
            documents: List of documents to store

        Returns:
            Number of documents actually stored (new + updated)
        """
        stored_count = 0

        for document in documents:
            try:
                # Check for existing document
                existing_doc = await get_document_by_url(document.url)

                if existing_doc:
                    # Calculate content hashes for comparison
                    current_hash = hashlib.sha256(document.text.encode()).hexdigest()
                    existing_hash = hashlib.sha256(
                        existing_doc.text.encode()
                    ).hexdigest()

                    if current_hash != existing_hash:
                        # Update existing document with new content
                        logger.info(f"Updating document: {document.url}")
                        document.id = existing_doc.id  # Preserve original ID
                        await mongo.db.documents.update_one(
                            {"url": document.url}, {"$set": document.model_dump()}
                        )
                        stored_count += 1
                    else:
                        logger.debug(f"Skipping unchanged document: {document.url}")
                        self.stats.duplicates_skipped += 1
                else:
                    # Create new document
                    logger.info(f"Creating new document: {document.url}")
                    await mongo.db.documents.insert_one(document.model_dump())
                    stored_count += 1

            except Exception as e:
                logger.error(f"Failed to store document {document.url}: {e}")

        return stored_count

    async def _process_crawl_result(
        self, result: CrawlResult, company: Company
    ) -> Optional[Document]:
        """
        Process a single crawl result through the analysis pipeline.

        Args:
            result: Crawl result from ToastCrawler
            company: Company being processed

        Returns:
            Document if legal and English, None otherwise
        """
        try:
            # Convert markdown to plain text for analysis
            text_content = markdown_to_text(result.markdown)

            # Detect locale
            locale_result = await self.analyzer.detect_locale(
                text_content, result.metadata
            )
            detected_locale = locale_result.get("locale", "en-US")
            language_name = locale_result.get("language_name", "English")

            logger.debug(
                f"Locale detection for {result.url}: {detected_locale} "
                f"({language_name}, confidence: {locale_result.get('confidence', 0):.2f})"
            )

            # Skip non-English documents*
            # TODO: Support other languages
            if "en" not in detected_locale.lower():
                logger.debug(f"Skipping non-English document: {result.url}")
                self.stats.non_english_skipped += 1
                return None

            self.stats.english_documents += 1

            # Classify document
            classification = await self.analyzer.classify_document(
                result.url, text_content, result.metadata
            )

            logger.debug(
                f"Classification for {result.url}: {classification.get('classification')} "
                f"(legal: {classification.get('is_legal_document')})"
            )

            # Skip non-legal documents
            if not classification.get("is_legal_document", False):
                logger.debug(f"Skipping non-legal document: {result.url}")
                return None

            self.stats.legal_documents_processed += 1

            # Detect regions
            region_detection = await self.analyzer.detect_regions(
                text_content, result.metadata, result.url
            )

            # Extract effective date
            effective_date_str = await self.analyzer.extract_effective_date(
                text_content, result.metadata
            )
            effective_date = None
            if effective_date_str:
                try:
                    effective_date = datetime.strptime(effective_date_str, "%Y-%m-%d")
                    logger.debug(f"Parsed effective date: {effective_date}")
                except ValueError as e:
                    logger.warning(
                        f"Failed to parse effective date '{effective_date_str}': {e}"
                    )

            # Extract title
            title_result = await self.analyzer.extract_title(
                result.markdown,
                result.metadata,
                result.url,
                classification.get("classification", "other"),
            )

            # Create document
            document = Document(
                title=title_result.get("title", "Untitled Legal Document"),
                url=result.url,
                company_id=company.id,
                markdown=result.markdown,
                text=text_content,
                metadata=result.metadata,
                doc_type=classification.get("classification", "other"),
                locale=detected_locale,
                regions=region_detection.get("regions", ["global"]),
                effective_date=effective_date,
            )

            effective_date_info = (
                f", effective: {document.effective_date.strftime('%Y-%m-%d')}"
                if document.effective_date
                else ""
            )
            logger.info(
                f"✅ Processed legal document: {document.title} "
                f"({document.doc_type}, {document.locale}, {document.regions}{effective_date_info})"
            )

            return document

        except Exception as e:
            logger.error(f"Failed to process crawl result {result.url}: {e}")
            return None

    async def _process_company(self, company: Company) -> List[Document]:
        """
        Process a single company through the complete pipeline.

        Args:
            company: Company to process

        Returns:
            List of processed and stored documents
        """
        company_start_time = time.time()
        log_memory_usage(f"Starting {company.name}")

        if not company.crawl_base_urls:
            logger.warning(f"No crawl base URLs for {company.name}")
            self.stats.companies_failed += 1
            self.stats.failed_company_slugs.append(company.slug)
            return []

        try:
            logger.info(
                f"🕷️ Crawling {company.name} ({len(company.domains)} domains) "
                f"from {len(company.crawl_base_urls)} base URLs"
            )

            # Create crawler and crawl documents
            crawler = self._create_crawler_for_company(company)
            crawl_results = []

            for base_url in company.crawl_base_urls:
                logger.info(f"Crawling base URL: {base_url}")
                results = await crawler.crawl(base_url)
                crawl_results.extend(results)

            self.stats.total_urls_crawled += len(crawl_results)
            self.stats.total_documents_found += len(crawl_results)

            logger.info(f"📄 Found {len(crawl_results)} documents for {company.name}")

            # Process each crawl result
            processed_documents = []
            for result in crawl_results:
                if result.success:
                    document = await self._process_crawl_result(result, company)
                    if document:
                        processed_documents.append(document)
                else:
                    logger.warning(
                        f"Failed to crawl {result.url}: {result.error_message}"
                    )

            # Store processed documents
            if processed_documents:
                stored_count = await self._store_documents(processed_documents)
                self.stats.legal_documents_stored += stored_count
                logger.success(
                    f"💾 Stored {stored_count}/{len(processed_documents)} "
                    f"legal documents for {company.name}"
                )
            else:
                logger.info(f"No legal documents found for {company.name}")

            self.stats.companies_processed += 1

            company_duration = time.time() - company_start_time
            log_memory_usage(f"Completed {company.name}")
            logger.success(
                f"✅ Completed {company.name} in {company_duration:.2f}s "
                f"({len(processed_documents)} legal docs)"
            )

            return processed_documents

        except Exception as e:
            logger.error(f"Failed to process company {company.name}: {e}")
            self.stats.companies_failed += 1
            self.stats.failed_company_slugs.append(company.slug)
            return []

    async def run(self, companies: List[Company] = None) -> ProcessingStats:
        """
        Execute the complete legal document crawling pipeline.

        Returns:
            ProcessingStats with comprehensive pipeline metrics
        """
        # Start comprehensive monitoring
        tracemalloc.start()
        pipeline_start_time = time.time()

        logger.info("🚀 Starting Legal Document Crawling Pipeline")
        log_memory_usage("Pipeline start")

        # Start background memory monitoring
        memory_task = asyncio.create_task(memory_monitor_task(30))

        try:
            # Get all companies
            companies = companies or await get_all_companies()
            logger.info(f"📊 Processing {len(companies)} companies")

            # Process companies sequentially for memory efficiency and rate limiting
            all_documents: list[Document] = []
            for i, company in enumerate(companies, 1):
                logger.info(
                    f"🏢 Processing company {i}/{len(companies)}: {company.name}"
                )
                documents = await self._process_company(company)
                all_documents.extend(documents)

                # Log progress
                if i % 5 == 0:  # Every 5 companies
                    logger.info(
                        f"📈 Progress: {i}/{len(companies)} companies, "
                        f"{self.stats.legal_documents_stored} documents stored"
                    )

            # Calculate final statistics
            self.stats.processing_time_seconds = time.time() - pipeline_start_time

            # Log comprehensive results
            logger.success("🎉 Pipeline completed successfully!")
            logger.info(f"📊 Companies processed: {self.stats.companies_processed}")
            logger.info(f"❌ Companies failed: {self.stats.companies_failed}")
            if self.stats.failed_company_slugs:
                logger.info(
                    f"❌ Failed company slugs: {', '.join(self.stats.failed_company_slugs)}"
                )
            logger.info(f"🌐 Total URLs crawled: {self.stats.total_urls_crawled}")
            logger.info(f"📄 Total documents found: {self.stats.total_documents_found}")
            logger.info(
                f"⚖️ Legal documents processed: {self.stats.legal_documents_processed}"
            )
            logger.info(
                f"💾 Legal documents stored: {self.stats.legal_documents_stored}"
            )
            logger.info(f"🗣️ English documents: {self.stats.english_documents}")
            logger.info(f"🌍 Non-English skipped: {self.stats.non_english_skipped}")
            logger.info(f"🔄 Duplicates skipped: {self.stats.duplicates_skipped}")
            logger.info(f"✅ Success rate: {self.stats.success_rate:.1f}%")
            logger.info(
                f"🎯 Legal detection rate: {self.stats.legal_detection_rate:.1f}%"
            )
            logger.info(f"⏱️ Total time: {self.stats.processing_time_seconds:.2f}s")

            return self.stats

        finally:
            # Cleanup and final monitoring
            memory_task.cancel()
            log_memory_usage("Pipeline end")

            current, peak = tracemalloc.get_traced_memory()
            logger.info(
                f"🧠 Memory usage: Current={current / 1024 / 1024:.1f}MB, "
                f"Peak={peak / 1024 / 1024:.1f}MB"
            )
            tracemalloc.stop()


async def main():
    """Main entry point for the crawling pipeline."""
    try:
        pipeline = LegalDocumentPipeline(
            max_depth=4,
            max_pages=1000,
            crawler_strategy="bfs",
            concurrent_limit=10,
            delay_between_requests=1.0,
        )

        stats = await pipeline.run()

        # Exit with appropriate code
        if stats.companies_failed > 0:
            failed_slugs = (
                ", ".join(stats.failed_company_slugs)
                if stats.failed_company_slugs
                else "unknown"
            )
            logger.warning(
                f"Pipeline completed with {stats.companies_failed} failures: {failed_slugs}"
            )
        else:
            logger.success("Pipeline completed successfully")
        exit(0)

    except KeyboardInterrupt:
        logger.warning("Pipeline interrupted by user")
        exit(130)
    except Exception as e:
        logger.error(f"Pipeline failed with error: {e}")
        exit(1)


if __name__ == "__main__":
    asyncio.run(main())
