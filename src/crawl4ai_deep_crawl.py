import asyncio
from loguru import logger
from dotenv import load_dotenv
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig  # type: ignore
from crawl4ai.content_scraping_strategy import LXMLWebScrapingStrategy  # type: ignore
from crawl4ai.deep_crawling import BestFirstCrawlingStrategy  # type: ignore
from crawl4ai.deep_crawling.scorers import KeywordRelevanceScorer  # type: ignore
from crawl4ai.deep_crawling.filters import (  # type: ignore
    FilterChain,
    ContentRelevanceFilter,
    DomainFilter,
    URLPatternFilter,
)
from crawl4ai.async_configs import BrowserConfig  # type: ignore

load_dotenv()


class LegalDocumentCrawler:
    """A crawler specialized for finding legal documents on websites."""

    def __init__(
        self,
        max_depth: int = 3,
        max_pages: int = 500,
        include_external: bool = False,
        verbose: bool = True,
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
                "privacy policy",
                "terms of service",
                "terms and conditions",
                "cookie policy",
                "end user license agreement",
                "data processing agreement",
                # Legal frameworks & regulations
                "gdpr",
                "ccpa",
                "caloppa",
                "hipaa",
                "coppa",
                "compliance",
                # Data-specific terms
                "data retention",
                "data protection",
                "personal data",
                "user data",
                "data collection",
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
                "statement",
                "data",
            ],
            weight=0.1,
        )

    def _create_domain_filter(self) -> DomainFilter:
        """Create the domain filter."""
        return DomainFilter(allowed_domains=["notion.so", "notion.com"])

    def _create_url_pattern_filter(self) -> URLPatternFilter:
        """Create the URL pattern filter."""
        return URLPatternFilter(patterns=["!*#*", "!*?*"])

    def _create_content_relevance_filter(self) -> ContentRelevanceFilter:
        """Create the content relevance filter."""
        relevancer_query = "legal documents like privacy policy, terms of service, cookie policy, gdrp, terms and conditions, etc. Content should not be a 404 page."
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
                    results.append(result)

                logger.info(f"Crawled {len(results)} pages from {url}")

                all_results.extend(results)

            return all_results


async def main():
    # urls = [
    #     "https://www.facebook.com/legal",
    #     "https://www.facebook.com/privacy",
    #     "https://www.facebook.com/terms",
    # ]

    # urls = ["https://policies.google.com/"]

    urls = ["https://www.notion.so/notion", "https://www.notion.com/help"]

    crawler = LegalDocumentCrawler()
    results = await crawler.crawl(urls)

    for result in results:
        logger.info(f"URL: {result.url}")
        logger.info(f"Metadata: {result.metadata}")
        # logger.info(f"Markdown: {result.markdown}")

    logger.info(f"Crawled {len(results)} pages in total")


if __name__ == "__main__":
    asyncio.run(main())
