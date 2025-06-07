import asyncio
import hashlib
import json
import os
from typing import Any

from crawl4ai import AsyncWebCrawler, CrawlerRunConfig  # type: ignore
from crawl4ai.async_configs import BrowserConfig  # type: ignore
from crawl4ai.content_scraping_strategy import LXMLWebScrapingStrategy  # type: ignore
from crawl4ai.deep_crawling import BestFirstCrawlingStrategy  # type: ignore
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
        default_user_agent = (
            "ToastAICrawler/1.0 (dev mode; site coming soon; contact: lvndry@proton.me)"
        )

        self.stream = stream
        self.max_depth = max_depth
        self.max_pages = max_pages
        self.allowed_domains = allowed_domains or []
        self.include_external = False
        self.verbose = verbose
        self.page_timeout = page_timeout
        self.user_agent = user_agent or default_user_agent

        # Initialize the crawler components
        self.browser_config = self._create_browser_config()

        self.keyword_relevance_scorer = self._create_keyword_relevance_scorer()
        self.content_relevance_filter = self._create_content_relevance_filter()
        self.domain_filter = self._create_domain_filter()
        self.url_pattern_filter = self._create_url_pattern_filter()
        self.filter_chain = self._create_filter_chain()

        self.strategy = self._create_strategy()
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
            # security
            "security",
            # privacy
            "privacy-policy",
            "privacy",
            # cookies
            "cookie",
            "cookies",
            "cookie-policy",
            # data
            "data",
            "subprocessor",
            # policy
            "policy",
            "policies",
            "use-policy",
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
            weight=len(keywords),
        )

    @deprecated("This filter is no longer used")
    def _create_domain_filter(self) -> DomainFilter:
        """Create the domain filter."""
        return DomainFilter(allowed_domains=self.allowed_domains)

    @deprecated("This filter is no longer used")
    def _create_url_pattern_filter(self) -> URLPatternFilter:
        """Create the URL pattern filter."""
        return URLPatternFilter(patterns=["*?*", "*#*", "*&*"], reverse=True)

    @deprecated("This filter is no longer used")
    def _create_content_relevance_filter(self) -> ContentRelevanceFilter:
        """Create the content relevance filter."""
        legal_keywords_query = (
            "privacy policy, terms of service, cookie policy, GDPR, "
            "terms and conditions, legal disclaimer, data protection"
        )
        threshold_score = 0.7

        return ContentRelevanceFilter(
            query=legal_keywords_query, threshold=threshold_score
        )

    def _create_filter_chain(self) -> FilterChain:
        """Create the filter chain."""
        return FilterChain(
            [
                self.domain_filter,
                self.url_pattern_filter,
                self.content_relevance_filter,
            ]
        )

    def _create_strategy(self) -> BestFirstCrawlingStrategy:
        """Create the crawling strategy."""
        return BestFirstCrawlingStrategy(
            max_depth=self.max_depth,
            max_pages=self.max_pages,
            include_external=self.include_external,
            url_scorer=self.keyword_relevance_scorer,
            # filter_chain=self.filter_chain,
        )

    def _create_crawler_config(self) -> CrawlerRunConfig:
        """Create the crawler configuration."""
        return CrawlerRunConfig(
            deep_crawl_strategy=self.strategy,
            exclude_external_links=not self.include_external,
            remove_overlay_elements=True,
            process_iframes=False,
            scraping_strategy=LXMLWebScrapingStrategy(),
            verbose=self.verbose,
            stream=self.stream,
            page_timeout=self.page_timeout,
            locale="en-US",  # TODO: make this configurable
            check_robots_txt=True,
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
                        logger.warning(f"Crawl failed: {result.error_message}")
                        logger.warning(f"Status code: {result.status_code}")

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
            "other",
        ]

    def _create_prompt(self, url: str, text: str, metadata: dict[str, Any]) -> str:
        """Create the classification prompt."""
        categories_list = "\n".join(f"- {cat}" for cat in self.categories)
        return f"""Analyze the url and content and metadata of the document and classify it into one of these categories:
        {categories_list}

        URL: {url}
        Content: {text[: self.max_content_length]}
        Metadata: {json.dumps(metadata, indent=2)}

        Return a JSON object with:
        - classification: the category
        - classification_justification: brief explanation of the classification
        - is_legal_document: boolean. If the URL has no mention of legal terms/keywords and that the content is short it's unlikely to be a legal document.
        - is_legal_document_justification: brief explanation of why the document is or is not a legal document.
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
                return locale

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
        detected_locale = result.get("locale", "en-US")
        confidence = result.get("confidence", 0.0)

        logger.info(
            f"LLM detected locale: {detected_locale} (confidence: {confidence})"
        )
        return detected_locale

    except Exception as e:
        logger.error(f"Error detecting locale with LLM: {str(e)}")
        return "en-US"  # Default fallback


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
            - specific_regions: list of specific regions/countries if not global
            - confidence: float between 0 and 1 indicating confidence

    """
    # Get a reasonable sample of text for analysis (first 3000 characters)
    text_sample = text[:3000] if len(text) > 3000 else text

    prompt = f"""Analyze this legal document and determine if it applies globally to all users or only to specific regions/countries.

URL: {url}
Text sample: {text_sample}
Metadata: {json.dumps(metadata, indent=2) if metadata else "None"}

Look for indicators such as:
- Geographic limitations ("This policy applies to users in...")
- Country-specific legal references (GDPR for EU, CCPA for California, etc.)
- Regional service availability mentions
- Jurisdiction clauses
- Regional contact information or addresses
- URL patterns indicating region (e.g., /eu/, /us/, country domains)

Return a JSON object with:
- is_global: boolean - true if document applies to all users globally, false if region-specific
- specific_regions: array of strings - list of specific regions/countries if not global (e.g., ["United States", "Canada", "European Union"])
- confidence: float between 0 and 1 indicating confidence in the determination
- justification: string explaining the reasoning behind the determination
- regional_indicators: array of strings - specific text snippets that indicate regional scope
"""

    system_prompt = """
    You are a legal document analyst specialized in determining geographic scope of policies and terms.
    Analyze documents to determine if they apply globally or to specific regions only.
    Be thorough in identifying regional limitations and geographic scope indicators.
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

        logger.info(
            f"Region detection for {url}: {'Global' if is_global else f'Specific regions: {specific_regions}'} "
            f"(confidence: {confidence})"
        )

        return {
            "is_global": is_global,
            "specific_regions": specific_regions,
            "confidence": confidence,
            "justification": justification,
            "regional_indicators": regional_indicators,
        }

    except Exception as e:
        logger.error(f"Error detecting regions with LLM: {str(e)}")
        return {
            "is_global": True,  # Default to global if detection fails
            "specific_regions": [],
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

    prompt = f"""Analyze this document and extract or generate the most appropriate title.

URL: {url}
Document Type: {doc_type}
Content sample: {markdown}
Metadata: {json.dumps(metadata, indent=2) if metadata else "None"}

Return a JSON object with:
- title: the most appropriate title for this document (max 8 words)
- confidence: float between 0 and 1 indicating confidence in the title

Look for the actual document title, not section headers. Generate professional titles like "Privacy Policy", "Terms of Service", etc.
"""

    system_prompt = """
    You are a document title extractor. Identify the main title of legal documents, ignoring section headers.
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
        extracted_title = result.get("title", "").strip()
        confidence = result.get("confidence", 0.0)

        logger.info(
            f"LLM extracted title: {extracted_title} (confidence: {confidence})"
        )
        return extracted_title

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
                    {"url": document.url}, {"$set": document.to_db()}
                )
            else:
                logger.info(f"Skipping document with URL: {document.url} (no changes)")
        else:
            # Create new document if URL doesn't exist
            logger.info(f"Creating new document with URL: {document.url}")
            await mongo.db.documents.insert_one(document.to_db())


async def process_company(company: Company) -> list[Document]:
    """
    Process a single company: crawl, classify and store its documents.

    Args:
        company: The company to process

    Returns:
        List of processed documents
    """
    if not company.crawl_base_urls:
        logger.warning(f"No crawl base URLs for {company.name}")
        return []

    crawler = LegalDocumentCrawler(
        allowed_domains=company.domains,
        verbose=True,
        stream=True,
    )

    classifier = DocumentClassifier()

    logger.info(
        f"Crawling {company.name} ({company.domains}) from {company.crawl_base_urls} base URLs"
    )

    # Crawl documents
    results = await crawler.crawl(company.crawl_base_urls)
    legal_documents: list[Document] = []

    for result in results:
        logger.info(f"URL: {result.url} - Metadata: {result.metadata}")

        text_content = markdown_to_text(result.markdown)

        # Detect locale for the document
        detected_locale = await detect_locale(text_content, result.metadata)
        logger.info(f"URL: {result.url} - Detected locale: {detected_locale}")

        # Detect regions for the document
        region_detection = await detect_regions(
            text_content, result.metadata, result.url
        )
        logger.info(f"URL: {result.url} - Region detection: {region_detection}")

        # Classify the document
        classification = await classifier.classify(
            result.url, text_content, result.metadata
        )
        logger.info(f"URL: {result.url} - Classification: {classification}")

        # Extract title for the document
        extracted_title = await extract_title(
            result.markdown,
            result.metadata,
            result.url,
            classification["classification"],
        )
        logger.info(f"URL: {result.url} - Extracted title: {extracted_title}")

        # Convert region detection results to Document regions format
        regions = []
        if region_detection["is_global"]:
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

            for specific_region in region_detection["specific_regions"]:
                mapped_region = region_mapping.get(specific_region.lower(), "Other")
                if mapped_region not in regions:
                    regions.append(mapped_region)

            # If no specific regions were mapped, default to global
            if not regions:
                regions = ["global"]

        legal_documents.append(
            Document(
                url=result.url,
                title=extracted_title,
                company_id=company.id,
                markdown=result.markdown,
                text=text_content,
                metadata=result.metadata,
                doc_type=classification["classification"],
                is_legal_document=classification["is_legal_document"],
                locale=detected_locale,
                regions=regions,
            )
        )

    # Filter to keep only legal documents
    legal_documents = [
        doc
        for doc in legal_documents
        if doc.is_legal_document and "en" in doc.locale.lower()
    ]

    # Store legal documents
    if legal_documents:
        await store_documents(legal_documents)
        logger.info(f"Stored {len(legal_documents)} documents for {company.name}")

    return legal_documents


async def main():
    companies = await get_all_companies()
    all_documents = []

    # Process companies sequentially to respect rate limits
    for i, company in enumerate(companies, 1):
        logger.info(f"Processing company {i}/{len(companies)}: {company.name}")
        documents = await process_company(company)
        all_documents.extend(documents)
        logger.info(f"Completed processing {company.name}")

    logger.info(f"Total documents processed: {len(all_documents)}")


if __name__ == "__main__":
    asyncio.run(main())
