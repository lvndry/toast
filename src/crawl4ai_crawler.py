import asyncio

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
from loguru import logger

from src.company import get_all_companies
from src.db import mongo
from src.document import Document

load_dotenv()


class LegalDocumentCrawler:
    """A crawler specialized for finding legal documents on websites."""

    def __init__(
        self,
        max_depth: int = 3,
        max_pages: int = 300,
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
                # Specific document titles (high priority)
                # "privacy policy",
                # "terms of service",
                # "terms and conditions",
                # "cookie policy",
                # "information security",
                # "end user license agreement",
                # "data processing agreement",
                # Legal frameworks & regulations
                "gdpr",
                "ccpa",
                "caloppa",
                "hipaa",
                "coppa",
                "compliance",
                # Data-specific terms
                # "data retention",
                # "data protection",
                # "personal data",
                # "user data",
                # "data collection",
                # keywords
                "cookie",
                "privacy",
                "terms",
                "conditions",
                "agreement",
                "license",
                "disclaimer",
                "notice",
                "policy",
                "data",
                "subprocessor",
                "copyright",
            ],
            weight=0.8,
        )

    def _create_domain_filter(self) -> DomainFilter:
        """Create the domain filter."""
        return DomainFilter(allowed_domains=self.allowed_domains)

    def _create_url_pattern_filter(self) -> URLPatternFilter:
        """Create the URL pattern filter."""
        return URLPatternFilter(patterns=["!*#*", "!*?*"])

    def _create_content_relevance_filter(self) -> ContentRelevanceFilter:
        """Create the content relevance filter."""
        relevancer_query = "legal documents like privacy policy, terms of service, cookie policy, gdrp, terms and conditions, etc. Content should not be a 404 page. Content should be in english"
        return ContentRelevanceFilter(query=relevancer_query, threshold=0.1)

    def _create_filter_chain(self) -> FilterChain:
        """Create the filter chain."""
        return FilterChain(
            [
                self.domain_filter,
                # self.url_pattern_filter,
                self.content_relevance_filter,
            ]
        )

    def _create_strategy(self) -> BestFirstCrawlingStrategy:
        """Create the crawling strategy."""
        return BestFirstCrawlingStrategy(
            max_depth=self.max_depth,
            include_external=self.include_external,
            url_scorer=self.keyword_relevance_scorer,
            filter_chain=self.filter_chain,
            max_pages=self.max_pages,
        )

    def _create_crawler_config(self) -> CrawlerRunConfig:
        """Create the crawler configuration."""
        return CrawlerRunConfig(
            deep_crawl_strategy=self.strategy,
            exclude_external_links=not self.include_external,
            remove_overlay_elements=True,
            process_iframes=True,
            scraping_strategy=LXMLWebScrapingStrategy(),
            verbose=self.verbose,
            stream=True,
        )

    async def crawl(self, urls: list[str]) -> list:
        """
        Crawl the given URLs for legal documents.

        Args:
            urls: List of URLs to crawl

        Returns:
            List of crawl results
        """
        all_results = []

        async with AsyncWebCrawler(config=self.browser_config) as crawler:
            results = []

            for url in urls:
                async for result in await crawler.arun(url, config=self.crawler_config):
                    if result.success:
                        results.append(result)
                    else:
                        logger.warning(f"Crawl failed: {result.error_message}")
                        logger.warning(f"Status code: {result.status_code}")

                logger.info(f"Crawled {len(results)} from {url}")

                all_results.extend(results)

            return all_results


async def crawl_documents_for_companies():
    # Used for testing without database
    # companies = [
    #     Company(
    #         id="1",
    #         name="Facebook",
    #         slug="facebook",
    #         domains=["facebook.com"],
    #         crawl_base_urls=[
    #             "https://facebook.com/legal",
    #             "https://facebook.com/privacy",
    #         ],
    #         categories=["test"],
    #     )
    # ]

    companies = await get_all_companies()

    documents: list[Document] = []

    companies = companies[:1]

    for company in companies:
        if not company.crawl_base_urls:
            logger.warning(f"No crawl base URLs for {company.name}")
            continue

        crawler = LegalDocumentCrawler(allowed_domains=company.domains, verbose=True)

        logger.info(
            f"Crawling {company.name} ({company.domains}) with {company.crawl_base_urls} base URLs"
        )

        results = await crawler.crawl(company.crawl_base_urls)

        for result in results:
            logger.info(f"URL: {result.url}")
            logger.info(f"Metadata: {result.metadata}")
            # logger.info(f"Markdown: {result.markdown}")

    return documents


async def document_classification(documents: list[Document]) -> list[Document]:
    """
    Classify the documents into categories.
    """
    classified_documents = []

    for document in documents:
        new_doc = Document(
            id=document.id,
            url=document.url,
            markdown=document.markdown,
            metadata=document.metadata,
            versions=document.versions,
            doc_type=document.doc_type,
            company_id=document.company_id,
        )

        # Classify the document
        if any(
            keyword in new_doc.url.lower() for keyword in ["privacy", "privacy-policy"]
        ):
            new_doc.doc_type = "privacy"
        elif any(keyword in new_doc.url.lower() for keyword in ["terms", "tos"]):
            new_doc.doc_type = "terms"
        elif any(
            keyword in new_doc.url.lower() for keyword in ["cookies", "cookie-policy"]
        ):
            new_doc.doc_type = "cookies"
        elif any(
            keyword in new_doc.url.lower()
            for keyword in ["gdpr", "ccpa", "caloppa", "hipaa", "coppa"]
        ):
            new_doc.doc_type = "compliance"
        else:
            new_doc.doc_type = "other"

        classified_documents.append(new_doc)

    return classified_documents


async def store_documents(documents: list[Document]):
    for document in documents:
        await mongo.db.documents.insert_one(document.model_dump())


if __name__ == "__main__":
    cralwed_documents = asyncio.run(crawl_documents_for_companies())
