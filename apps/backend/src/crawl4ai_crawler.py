"""
Legacy module, not used anymore.
Prefer using the new crawler in src/crawler.py
"""

import asyncio
import hashlib
import json
import os
import time
import tracemalloc
from typing import Any

from crawl4ai import AsyncWebCrawler, CrawlerRunConfig  # type: ignore
from crawl4ai.async_configs import BrowserConfig  # type: ignore
from crawl4ai.content_scraping_strategy import LXMLWebScrapingStrategy  # type: ignore
from crawl4ai.deep_crawling import (  # type: ignore
    BestFirstCrawlingStrategy,
    BFSDeepCrawlStrategy,
    DFSDeepCrawlStrategy,
)
from crawl4ai.deep_crawling.filters import (  # type: ignore
    ContentRelevanceFilter,
    DomainFilter,
    FilterChain,
    URLPatternFilter,
)
from crawl4ai.deep_crawling.scorers import KeywordRelevanceScorer  # type: ignore
from dotenv import load_dotenv
from litellm import acompletion
from loguru import logger
from typing_extensions import deprecated

from src.company import Company
from src.db import get_all_companies, get_document_by_url, mongo
from src.document import DocType, Document
from src.utils.markdown import markdown_to_text
from src.utils.perf import log_memory_usage, memory_monitor_task

load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

if not MISTRAL_API_KEY:
    raise ValueError("MISTRAL_API_KEY environment variable is not set")


class LegalDocumentCrawler:
    """A crawler specialized for finding legal documents on websites."""

    def __init__(
        self,
        max_depth: int = 3,
        max_pages: int = 500,
        stream: bool = False,
        user_agent: str | None = None,
        locale: str = "en-US",
        allowed_domains: list[str] | None = None,
        verbose: bool = False,
        page_timeout: int = 60000,  # ms
    ):
        """
        Initialize the legal document crawler.

        Args:
            max_depth: Maximum crawl depth
            max_pages: Maximum number of pages to crawl
            stream: Whether to stream the output
            user_agent: User agent to use for the crawler
            allowed_domains: List of allowed domains
            verbose: Whether to print verbose output
            page_timeout: Timeout for each page in milliseconds
        """
        default_user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0 (en-US)"

        self.stream = stream
        self.max_depth = max_depth
        self.max_pages = max_pages
        self.allowed_domains = allowed_domains or []
        self.include_external = False
        self.verbose = verbose
        self.page_timeout = page_timeout
        self.user_agent = user_agent or default_user_agent
        self.locale = locale

        # Initialize the crawler components
        self.browser_config = self._create_browser_config()

        self.keyword_relevance_scorer = self._create_keyword_relevance_scorer()
        self.content_relevance_filter = self._create_content_relevance_filter()
        self.domain_filter = self._create_domain_filter()
        self.url_pattern_filter = self._create_url_pattern_filter()
        self.filter_chain = self._create_filter_chain()

        self.best_strategy = self._create_best_strategy()
        self.bfs_strategy = self._create_bfs_strategy()
        self.dfs_strategy = self._create_dfs_strategy()
        self.crawler_config = self._create_crawler_config()

    def _create_browser_config(self) -> BrowserConfig:
        """Create the browser configuration."""

        return BrowserConfig(
            user_agent=self.user_agent, text_mode=True, verbose=self.verbose
        )

    def _create_keyword_relevance_scorer(self) -> KeywordRelevanceScorer:
        """Create the keyword relevance scorer."""
        keywords = [
            # generic terms
            "notice",
            "trust",
            "compliance",
            "conditions",
            "agreement",
            "license",
            "disclaimer",
            "legal",
            "rules",
            "consent",
            "rights",
            # security
            "security",
            # privacy
            "privacy-policy",
            "privacy",
            # cookies
            "cookie",
            "cookie-policy",
            # data
            "data",
            "processor",
            "subprocessor",
            "partners",
            # policy
            "policy",
            "policies",
            # terms
            "terms",
            "terms-of-service",
            "terms-and-conditions",
            "terms-of-use",
            # protection & safety
            "coppa",
            "safety",
            # copyright
            "copyright",
            "dmca",
            # regional terms
            "gdpr",
            "hipaa",
        ]

        return KeywordRelevanceScorer(
            keywords=keywords,
            weight=0,
        )

    @deprecated("This filter is no longer used")
    def _create_domain_filter(self) -> DomainFilter:
        """Create the domain filter."""
        return DomainFilter(allowed_domains=self.allowed_domains)

    @deprecated("This filter is no longer used")
    def _create_url_pattern_filter(self) -> URLPatternFilter:
        """Create the URL pattern filter."""
        patterns = [
            "*?*",
            "*#*",
            "*&*",
        ]

        return URLPatternFilter(
            patterns=patterns,
            reverse=True,
        )

    @deprecated("This filter is no longer used")
    def _create_content_relevance_filter(self) -> ContentRelevanceFilter:
        """Create the content relevance filter."""
        legal_keywords_query = "privacy policy, terms of service, cookie policy, GDPR, terms and conditions, legal disclaimer, data protection, privacy, privacy policy, cookie, cookies, cookie policy, data, processor, subprocessor, partners, policy, policies, use policy, terms, terms of service, terms and conditions, terms of use, coppa, safety, copyright, dmca, gdpr, hipaa"
        threshold_score = 0

        return ContentRelevanceFilter(
            query=legal_keywords_query, threshold=threshold_score
        )

    @deprecated("This filter is no longer used")
    def _create_filter_chain(self) -> FilterChain:
        """Create the filter chain."""
        return FilterChain([self.content_relevance_filter])

    def _create_best_strategy(self) -> BestFirstCrawlingStrategy:
        """Create the crawling strategy."""
        return BestFirstCrawlingStrategy(
            max_depth=self.max_depth,
            max_pages=self.max_pages,
            include_external=self.include_external,
            url_scorer=self.keyword_relevance_scorer,
        )

    def _create_bfs_strategy(self) -> BFSDeepCrawlStrategy:
        """Create the BFS (Breadth-First Search) crawling strategy."""
        return BFSDeepCrawlStrategy(
            max_depth=self.max_depth,
            max_pages=self.max_pages,
            include_external=self.include_external,
            url_scorer=self.keyword_relevance_scorer,
        )

    def _create_dfs_strategy(self) -> DFSDeepCrawlStrategy:
        """Create the DFS (Depth-First Search) crawling strategy."""
        return DFSDeepCrawlStrategy(
            max_depth=self.max_depth,
            max_pages=self.max_pages,
            include_external=self.include_external,
            url_scorer=self.keyword_relevance_scorer,
        )

    def _create_crawler_config(self) -> CrawlerRunConfig:
        """Create the crawler configuration."""
        return CrawlerRunConfig(
            deep_crawl_strategy=self.best_strategy,
            scraping_strategy=LXMLWebScrapingStrategy(),
            stream=self.stream,
            exclude_external_links=not self.include_external,
            remove_overlay_elements=True,
            process_iframes=False,
            verbose=self.verbose,
            page_timeout=self.page_timeout,
            locale=self.locale,
            # check_robots_txt=True,
        )

    def clean_url(self, url: str) -> str:
        """
        Clean a URL by removing query parameters and hash fragments.

        Args:
            url: The URL to clean

        Returns:
            str: The cleaned URL
        """
        whitelist_urls = [
            "amazon.com",
            "youtube.com",
        ]

        if url in whitelist_urls:
            return url

        special_chars = ["#", "?", "&"]
        for char in special_chars:
            url = url.split(char)[0]
        return url

    async def crawl(self, urls: list[str]) -> list:
        """
        Crawl the given URLs for legal documents.

        Args:
            urls: List of URLs to crawl

        Returns:
            List of crawl results
        """
        all_results = []
        seen_base_urls = set()

        async with AsyncWebCrawler(
            config=self.browser_config, verbose=self.verbose
        ) as crawler:
            for url in urls:
                results = []
                async for result in await crawler.arun(url, config=self.crawler_config):
                    if result.success:
                        base_url = self.clean_url(result.url)
                        if base_url not in seen_base_urls:
                            seen_base_urls.add(base_url)
                            # Create a new result with the cleaned URL
                            result.url = base_url
                            results.append(result)
                        else:
                            logger.info(f"Skipping duplicate base URL: {base_url}")
                    else:
                        logger.warning(
                            f"Crawl failed: {result.error_message} for {url} with status code {result.status_code}"
                        )

                logger.info(f"Crawled {len(results)} from {url}")
                all_results.extend(results)

            return all_results


class DocumentClassifier:
    """A class for classifying legal documents using LLMs."""

    def __init__(
        self,
        model: str = "mistral/mistral-small-latest",
        temperature: float = 0.1,
        max_content_length: int = 5000,
    ):
        """
        Initialize the document classifier.

        Args:
            model: The LLM model to use for classification
            temperature: The temperature for model generation
            max_content_length: Maximum length of content to send to the model
        """
        self.model = model
        self.temperature = temperature
        self.max_content_length = max_content_length
        self.api_key = MISTRAL_API_KEY

        self.categories: list[DocType] = [
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

    def _create_prompt(self, url: str, text: str, metadata: dict[str, Any]) -> str:
        """Create the classification prompt."""
        categories_list = "\n".join(f"- {cat}" for cat in self.categories)
        return f"""You are analyzing the content of a crawled webpage (text only not html). Your task is to determine whether the content is meaningful and classifiable or if it consists primarily of superficial webpage elements (e.g., cookie banners, app download prompts, unsupported browser messages).

Use the following predefined list of content categories:
    {categories_list}

Consider the following inputs:
- URL: {url}
- Content: {text[: self.max_content_length]}
- Metadata: {json.dumps(metadata, indent=2)}

Please return a JSON object with the following fields:

- classification: the most appropriate category from the list above. If the content is mostly superficial (e.g., cookie banners, unsupported browser messages, etc.) or lacks meaningful information, return "other".
- classification_justification: a brief explanation of why this category was selected, including any signals in the content or metadata that supported this choice.
- is_legal_document: a boolean. This should be True only if the page contains substantive legal text (e.g., terms of service, privacy policy, data protection policy, etc.). Short, generic cookie banners or links to external legal documents do not count.
- is_legal_document_justification: a short rationale for your legal classification decision, including whether any legal language, structure, or keywords were present.

Use caution: Web crawlers often pick up limited or partial page content. If the content appears incomplete, vague, or primarily navigational or promotional, treat it with skepticism and prefer "other" unless clear evidence suggests a more specific classification.
"""

    async def classify(
        self, url: str, text: str, metadata: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Classify a document using the configured LLM.

        Args:
            url: The URL of the document
            text: The document content in text format
            metadata: Additional metadata about the document

        Returns:
            Dict containing classification results
        """
        prompt = self._create_prompt(url, text, metadata)
        system_prompt = """
        You are a document classifier specialized in legal documents. Analyze the content and classify it accurately.
        """

        try:
            response = await acompletion(
                model=self.model,
                api_key=self.api_key,
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                temperature=self.temperature,
            )

            result = json.loads(response.choices[0].message.content)

            # Validate the classification is in our known categories
            if result["classification"] not in self.categories:
                logger.warning(f"Unknown classification: {result['classification']}")
                result["classification"] = "other"

            return result

        except Exception as e:
            logger.error(f"Error classifying document with {self.model}: {str(e)}")
            return {
                "classification": "other",
                "classification_justification": str(e),
                "is_legal_document": False,
                "is_legal_document_justification": str(e),
            }


async def detect_locale(text: str, metadata: dict[str, Any]) -> str:
    """
    Detect the locale of a document.

    First checks metadata for og:locale, then uses LLM to detect from text sample.

    Args:
        text: The document content in text format
        metadata: Document metadata that might contain locale information

    Returns:
        str: Detected locale (e.g., "en-US", "fr-FR", "de-DE")
    """
    if metadata:
        for key in ["og:locale", "og:language", "locale", "language", "lang"]:
            if key in metadata and metadata[key]:
                locale = metadata[key]
                logger.success(f"Found locale in metadata ({key}): {locale}")
                return {
                    "locale": locale,
                    "confidence": 1.0,
                    "language_name": locale,
                }

    # If not found in metadata, use LLM to detect locale
    logger.info("Locale not found in metadata, using LLM to detect from text")

    # Get a sample from the middle of the text (1000 characters)
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
- locale: the detected locale in format like "en-US", "fr-FR", "de-DE", "es-ES", etc.
- confidence: float between 0 and 1 indicating confidence in the detection
- language_name: human readable language name (e.g., "English", "French", "German")

Be as specific as possible with the locale (include country code when possible).
"""

    system_prompt = """
    You are a language detection expert. Analyze the given text and determine its language and locale accurately.
    Return results in the specified JSON format.
    """

    try:
        response = await acompletion(
            model="mistral/mistral-small-latest",
            api_key=MISTRAL_API_KEY,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
        )

        result = json.loads(response.choices[0].message.content)

        return result

    except Exception as e:
        logger.error(f"Error detecting locale with LLM: {str(e)}")
        return {
            "locale": "en-US",
            "confidence": 1.0,
            "language_name": "English",
        }


async def detect_regions(
    text: str, metadata: dict[str, Any], url: str
) -> dict[str, Any]:
    """
    Detect if a document applies globally or to specific regions only.

    Args:
        text: The document content in text format
        metadata: Document metadata that might contain regional information
        url: Document URL which might contain regional indicators

    Returns:
        dict: Contains region detection results with keys:
            - is_global: boolean indicating if document applies globally
            - regions: list of mapped region codes for Document (e.g., ["US", "EU", "global"])
            - confidence: float between 0 and 1 indicating confidence
            - justification: string explaining the reasoning behind the determination
            - regional_indicators: list of text snippets that indicate regional scope

    """
    # Get a reasonable sample of text for analysis (first 3000 characters)
    text_sample = text[:3000] if len(text) > 3000 else text

    prompt = f"""Analyze this legal document excerpt to determine whether it applies globally to all users or only to specific regions or countries.

You are given:
- URL: {url}
- Text sample (excerpt, not full document): {text_sample}
- Metadata (e.g., page title, language, headers): {json.dumps(metadata, indent=2) if metadata else "None"}

Your task:
1. Determine whether the legal document has **global applicability** or is **region-specific**.
2. Look for regional indicators, such as:
   - Geographic limitations (e.g., "This policy applies to users in...")
   - Legal frameworks (e.g., GDPR for EU, CCPA for California)
   - Jurisdiction clauses (e.g., "governed by the laws of...")
   - Region-specific service availability or contact info
   - Regional domains or paths in the URL (e.g., /eu/, /us/, country TLDs)

Return a JSON object with the following fields:

{{
    "is_global": boolean, // true if it applies worldwide, false if region-specific
    "specific_regions": string[], // e.g. ["United States", "European Union"] if not global
    "confidence": float, // between 0 and 1, based on the number and clarity of indicators
    "justification": string, // reasoning with reference to document content and metadata
    "regional_indicators": string[] // exact phrases or snippets suggesting regional scope
}}

Notes:

- Confidence should reflect both presence and clarity of geographic indicators.
- If global applicability is claimed but regional laws are mentioned, consider whether those are additive or limiting.
- Consider metadata and URL patterns as supporting evidence of scope.
"""

    system_prompt = """You are a legal document analyst specializing in determining the geographic scope of policies, terms, and privacy notices.

Your task is to assess whether a given document applies globally or only to specific regions or jurisdictions.

Focus on identifying explicit and implicit regional limitations.
Look for:
- Geographic qualifiers (e.g., "users in the United States")
- Region-specific legal references (e.g., GDPR, CCPA)
- Jurisdiction and governing law clauses
- Regional contact details or service disclaimers
- URL paths or domains suggesting regional segmentation (e.g., /eu/, /ca/)

Be rigorous and careful:
- Distinguish between global applicability with regional clauses vs. region-limited applicability.
- Consider metadata (titles, headers, domain patterns) alongside content.
- Resolve conflicts thoughtfully and assign a confidence score based on signal clarity and coverage.

Your response will help determine legal applicability across jurisdictions, so precision is essential.
"""

    try:
        response = await acompletion(
            model="mistral/mistral-small-latest",
            api_key=MISTRAL_API_KEY,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
        )

        result = json.loads(response.choices[0].message.content)

        # Validate and set defaults
        is_global = result.get("is_global", True)
        specific_regions = result.get("specific_regions", [])
        confidence = result.get("confidence", 0.0)
        justification = result.get("justification", "")
        regional_indicators = result.get("regional_indicators", [])

        # Convert region detection results to Document regions format
        regions = []
        if is_global:
            regions = ["global"]
        else:
            # Map specific regions to Document Region literals
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
            }

            for specific_region in specific_regions:
                mapped_region = region_mapping.get(specific_region.lower(), "Other")
                if mapped_region not in regions:
                    regions.append(mapped_region)

            # If no specific regions were mapped, default to global
            if not regions:
                regions = ["global"]

        return {
            "is_global": is_global,
            "regions": regions,
            "confidence": confidence,
            "justification": justification,
            "regional_indicators": regional_indicators,
        }

    except Exception as e:
        logger.error(f"Error detecting regions with LLM: {str(e)}")
        return {
            "is_global": True,  # Default to global if detection fails
            "regions": ["global"],
            "confidence": 0.0,
            "justification": f"Error during detection: {str(e)}",
            "regional_indicators": [],
        }


async def extract_title(
    markdown: str, metadata: dict[str, Any], url: str, doc_type: str
) -> str:
    """
    Extract the title of a document using LLM analysis.

    Args:
        markdown: The document markdown content
        metadata: Document metadata that might contain title information
        url: Document URL
        doc_type: Document type classification

    Returns:
        str: Extracted or generated title
    """

    prompt = f"""Analyze this webpage and extract the most accurate and specific title.

URL: {url}
Document Type: {doc_type}
Content sample: {markdown}
Metadata: {json.dumps(metadata, indent=2) if metadata else "None"}

Instructions:
    - Extract the actual document title, not a section header or a heading from within the body.
    - Do not generate or paraphrase the title — extract it verbatim from the content or metadata.
    - Prefer titles that explicitly reference the product or service discussed in the document.
    - If multiple candidates are available (e.g. metadata title, visible title at top), choose the one most relevant to both the document's legal role and the product it refers to.
    - Avoid overly generic titles (e.g. "Terms of Service") unless they include product or company identifiers.
    - Ignore navigation labels or internal anchors unless clearly functioning as the title.

Return a JSON object with:
    - title: the best extracted document title (max 12 words)
    - alternative_titles: a list of alternative titles that you considered but did not use
"""

    system_prompt = """You are a document title extractor specializing in legal, policy, and compliance documents.
Your task is to extract the main title of the document, not section headers or internal headings.

Be precise:
- Focus on titles that refer to the entire document.
- Ignore headings that belong to sections within the document.
- Prioritize titles that mention the relevant product, service, or company.
- If multiple candidates are present, select the one that best captures the scope and subject of the document.

Do not generate or rewrite — extract only what is present in the text or metadata.
"""

    try:
        response = await acompletion(
            model="mistral/mistral-small-latest",
            api_key=MISTRAL_API_KEY,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
        )

        result = json.loads(response.choices[0].message.content)

        return result

    except Exception as e:
        logger.error(f"Error extracting title with LLM: {str(e)}")

    # Fallback to document type-based title
    type_titles = {
        "privacy_policy": "Privacy Policy",
        "terms_of_service": "Terms of Service",
        "cookie_policy": "Cookie Policy",
        "terms_and_conditions": "Terms and Conditions",
        "data_processing_agreement": "Data Processing Agreement",
        "gdpr_policy": "GDPR Policy",
        "copyright_policy": "Copyright Policy",
    }

    return type_titles.get(doc_type, "Legal Document")


async def store_documents(documents: list[Document]):
    """Store documents with deduplication and update logic."""
    for document in documents:
        # Check if document with same URL exists
        existing_doc = await get_document_by_url(document.url)

        if existing_doc:
            # Calculate SHA-256 hash of the document text
            current_hash = hashlib.sha256(document.text.encode()).hexdigest()

            # Calculate SHA-256 hash of existing document text
            existing_hash = hashlib.sha256(existing_doc.text.encode()).hexdigest()

            if current_hash != existing_hash:
                # Update existing document if content is different
                logger.info(f"Updating document with URL: {document.url}")
                document.id = existing_doc.id  # Preserve the original ID
                await mongo.db.documents.update_one(
                    {"url": document.url}, {"$set": document.model_dump()}
                )
            else:
                logger.info(f"Skipping document with URL: {document.url} (no changes)")
        else:
            # Create new document if URL doesn't exist
            logger.info(f"Creating new document with URL: {document.url}")
            await mongo.db.documents.insert_one(document.model_dump())


async def process_company(company: Company) -> list[Document]:
    """
    Process a single company: crawl, classify and store its documents.

    Args:
        company: The company to process

    Returns:
        List of processed documents
    """
    company_start_time = time.time()
    log_memory_usage(f"Starting {company.name}")

    if not company.crawl_base_urls:
        logger.warning(f"No crawl base URLs for {company.name}")
        return []

    crawler = LegalDocumentCrawler(
        allowed_domains=company.domains,
        verbose=True,
        stream=True,
        max_depth=5,
        user_agent="random",
    )

    classifier = DocumentClassifier()

    logger.info(
        f"Crawling {company.name} ({company.domains}) from {company.crawl_base_urls} base URLs"
    )

    # Crawl documents
    results = await crawler.crawl(company.crawl_base_urls)
    log_memory_usage(f"After crawling {company.name}")
    legal_documents: list[Document] = []

    for result in results:
        logger.info(f"URL: {result.url} - Metadata: {result.metadata}")

        text_content = markdown_to_text(result.markdown)

        # Detect locale for the document
        locale_result = await detect_locale(text_content, result.metadata)
        detected_locale = locale_result.get("locale", "en-US")
        locale_confidence = locale_result.get("confidence", 0.0)
        logger.info(
            f"URL: {result.url} - Detected locale: {detected_locale} (confidence: {locale_confidence})"
        )

        # Skip if not in English - TODO: might support other languages later
        if "en" not in locale_result["language_name"].lower():
            logger.info(f"Skipping {result.url} - Not in English")
            continue

        # Classify the document
        classification = await classifier.classify(
            result.url, text_content, result.metadata
        )
        logger.info(f"URL: {result.url} - Classification: {classification}")

        # Skip if not a legal document
        if not classification["is_legal_document"]:
            logger.info(f"Skipping {result.url} - Not classified as a legal document")
            continue

        # Detect regions for the document
        region_detection = await detect_regions(
            text_content, result.metadata, result.url
        )
        logger.info(f"URL: {result.url} - Region detection: {region_detection}")

        # Extract title for the document
        title_result = await extract_title(
            result.markdown,
            result.metadata,
            result.url,
            classification["classification"],
        )
        extracted_title = title_result.get("title", "").strip()
        title_confidence = title_result.get("confidence", 0.0)

        logger.info(
            f"URL: {result.url} - Extracted title: {extracted_title} (confidence: {title_confidence})"
        )

        legal_documents.append(
            Document(
                title=extracted_title,
                url=result.url,
                company_id=company.id,
                markdown=result.markdown,
                text=text_content,
                metadata=result.metadata,
                doc_type=classification["classification"],
                is_legal_document=classification["is_legal_document"],
                locale=detected_locale,
                regions=region_detection["regions"],
            )
        )

    # Store legal documents
    if legal_documents:
        await store_documents(legal_documents)
        logger.info(f"Stored {len(legal_documents)} documents for {company.name}")

    company_end_time = time.time()
    company_duration = company_end_time - company_start_time
    log_memory_usage(f"Completed {company.name}")
    logger.success(
        f"✅ Completed processing {company.name} in {company_duration:.2f} seconds"
    )

    return legal_documents


async def main():
    # Start memory tracking
    tracemalloc.start()
    main_start_time = time.time()

    logger.info("🚀 Starting document crawling process...")
    log_memory_usage("Initial")

    # Start background memory monitoring (optional - logs every 30 seconds)
    memory_task = asyncio.create_task(memory_monitor_task(30))

    companies = await get_all_companies()
    all_documents = []

    # Process companies sequentially to respect rate limits
    for i, company in enumerate(companies, 1):
        logger.info(f"Processing company {i}/{len(companies)}: {company.name}")
        documents = await process_company(company)
        all_documents.extend(documents)

        # Cancel the background memory monitoring task
    memory_task.cancel()

    main_end_time = time.time()
    total_duration = main_end_time - main_start_time

    # Log final memory usage and tracemalloc stats
    log_memory_usage("Final")

    current, peak = tracemalloc.get_traced_memory()
    logger.info(
        f"📊 Memory trace: Current={current / 1024 / 1024:.1f}MB, "
        f"Peak={peak / 1024 / 1024:.1f}MB"
    )
    tracemalloc.stop()

    logger.success(f"🎉 Total documents processed: {len(all_documents)}")
    logger.success(
        f"⏱️  Total runtime: {total_duration:.2f} seconds ({total_duration / 60:.2f} minutes)"
    )


if __name__ == "__main__":
    asyncio.run(main())
