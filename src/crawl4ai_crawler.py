import asyncio
import json
import os
from typing import Any, Dict

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
from litellm import completion
from loguru import logger

from src.company import Company
from src.db import get_all_companies, mongo
from src.document import Document

load_dotenv()


class LegalDocumentCrawler:
    """A crawler specialized for finding legal documents on websites."""

    def __init__(
        self,
        stream: bool = False,
        max_depth: int = 3,
        max_pages: int = 100,
        allowed_domains: list[str] | None = None,
        include_external: bool = False,
        verbose: bool = False,
    ):
        """
        Initialize the legal document crawler.

        Args:
            max_depth: Maximum crawl depth
            max_pages: Maximum number of pages to crawl
            include_external: Whether to include external links
            verbose: Whether to print verbose output
        """
        self.stream = stream
        self.max_depth = max_depth
        self.max_pages = max_pages
        self.allowed_domains = allowed_domains or []
        self.include_external = include_external
        self.verbose = verbose

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
        return BrowserConfig(verbose=self.verbose)

    def _create_keyword_relevance_scorer(self) -> KeywordRelevanceScorer:
        """Create the keyword relevance scorer."""
        return KeywordRelevanceScorer(
            keywords=[
                # "privacy policy",
                # "terms of service",
                # "terms and conditions",
                # "cookie policy",
                # "information security",
                # "end user license agreement",
                # "data processing agreement",
                "gdpr",
                # "ccpa",
                # "caloppa",
                # "hipaa",
                # "coppa",
                "compliance",
                # Data-specific terms
                # "data retention",
                # "data protection",
                # "personal data",
                # "user data",
                # "data collection",
                "cookie",
                "privacy",
                "policy",
                "terms",
                "conditions",
                "agreement",
                "license",
                "disclaimer",
                "notice",
                "data",
                "subprocessor",
                "copyright",
            ],
            weight=0.7,
        )

    def _create_domain_filter(self) -> DomainFilter:
        """Create the domain filter."""
        return DomainFilter(allowed_domains=self.allowed_domains)

    def _create_url_pattern_filter(self) -> URLPatternFilter:
        """Create the URL pattern filter."""
        return URLPatternFilter(patterns=["*?*", "*#*", "*&*"], reverse=True)

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
                # self.url_pattern_filter,
                # self.content_relevance_filter,
            ]
        )

    def _create_strategy(self) -> BestFirstCrawlingStrategy:
        """Create the crawling strategy."""
        return BestFirstCrawlingStrategy(
            max_depth=self.max_depth,
            max_pages=self.max_pages,
            include_external=self.include_external,
            url_scorer=self.keyword_relevance_scorer,
            filter_chain=self.filter_chain,
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
            "https://www.amazon.com",
            "https://www.youtube.com",
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

        async with AsyncWebCrawler(config=self.browser_config) as crawler:
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
        max_content_length: int = 4000,
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
        self.api_key = os.getenv("MISTRAL_API_KEY")

        if not self.api_key:
            raise ValueError("MISTRAL_API_KEY environment variable is not set")

        self.categories = [
            "privacy_policy",
            "terms_of_service",
            "cookie_policy",
            "terms_and_conditions",
            "data_processing_agreement",
            "gdpr_policy",
            "other",
        ]

    def _create_prompt(self, url: str, markdown: str, metadata: Dict[str, Any]) -> str:
        """Create the classification prompt."""
        categories_list = "\n".join(f"- {cat}" for cat in self.categories)
        return f"""Analyze this document and classify it into one of these categories:
        {categories_list}

        URL: {url}
        Content: {markdown[: self.max_content_length]}
        Metadata: {json.dumps(metadata, indent=2)}

        Return a JSON object with:
        - classification: the category
        - classification_confidence: float between 0 and 1
        - is_legal_document: boolean
        - is_legal_document_confidence: float between 0 and 1
        - explanation: brief explanation of the classification
        """

    async def classify(
        self, url: str, markdown: str, metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Classify a document using the configured LLM.

        Args:
            url: The URL of the document
            markdown: The document content in markdown format
            metadata: Additional metadata about the document

        Returns:
            Dict containing classification results
        """
        prompt = self._create_prompt(url, markdown, metadata)
        system_prompt = """
        You are a document classifier specialized in legal documents. Analyze the content and classify it accurately.
        """

        try:
            response = completion(
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
                "classification_confidence": 0.0,
                "is_legal_document": False,
                "is_legal_document_confidence": 0.0,
                "explanation": str(e),
            }


async def store_documents(documents: list[Document]):
    await asyncio.gather(
        *[
            mongo.db.documents.insert_one(document.model_dump())
            for document in documents
        ]
    )


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

    logger.info(
        f"Crawling {company.name} ({company.domains}) from {company.crawl_base_urls} base URLs"
    )

    # Crawl documents
    results = await crawler.crawl(company.crawl_base_urls)
    documents: list[Document] = []

    for result in results:
        logger.info(f"URL: {result.url} -  Metadata: {result.metadata}")
        documents.append(
            Document(
                url=result.url,
                company_id=company.id,
                markdown=result.markdown,
                metadata=result.metadata,
                doc_type="other",  # temporary, classification is done on a later stage
            )
        )

    # Create classifier instance
    classifier = DocumentClassifier()

    # Classify documents in parallel
    classifications = await asyncio.gather(
        *[
            classifier.classify(
                url=doc.url, markdown=doc.markdown, metadata=doc.metadata
            )
            for doc in documents
        ]
    )

    # Update documents with classifications
    legal_documents = []
    for doc, classification in zip(documents, classifications):
        logger.info(f"URL: {doc.url} - Classification: {classification}")
        doc.doc_type = classification["classification"]
        doc.is_legal_document = classification["is_legal_document"]

        if doc.is_legal_document:
            legal_documents.append(doc)

    # Store legal documents
    if legal_documents:
        await store_documents(legal_documents)
        logger.info(f"Stored {len(legal_documents)} documents for {company.name}")

    return legal_documents


async def main():
    # Get all companies
    companies = await get_all_companies()

    # Process all companies in parallel
    all_documents = await asyncio.gather(
        *[process_company(company) for company in companies]
    )

    # Flatten the list of documents
    total_documents = [doc for docs in all_documents for doc in docs]
    logger.info(f"Total documents processed: {len(total_documents)}")


if __name__ == "__main__":
    asyncio.run(main())
