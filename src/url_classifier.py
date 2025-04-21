import json
import asyncio
import logging
from datetime import datetime
from typing import Dict, Any, List
from firecrawl import FirecrawlApp
from litellm import completion
from tqdm.asyncio import tqdm as async_tqdm


logger = logging.getLogger("WebpageClassifier")


class WebpageClassifier:
    """Classifies webpages into categories using Firecrawl and LiteLLM with batch processing"""

    def __init__(
        self,
        firecrawl_api_key: str,
        verbose: bool = True,
        max_retries: int = 3,
        initial_retry_delay: int = 5,
    ):
        self.firecrawl = FirecrawlApp(api_key=firecrawl_api_key)
        self.llm_model = "mistral/mistral-small-latest"
        self.verbose = verbose
        self.max_retries = max_retries
        self.initial_retry_delay = initial_retry_delay

        if verbose and not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)
            logger.setLevel(logging.INFO)

    def _extract_dates(self, metadata: Dict[str, Any]) -> tuple:
        """Extract dates from Firecrawl metadata"""
        logger.debug("Extracting dates from metadata: %s", metadata)
        created = None
        updated = None

        # Try publishedDate first
        if published := metadata.get("publishedDate"):
            try:
                created = (
                    datetime.fromisoformat(published.rstrip("Z")).date().isoformat()
                )
            except (ValueError, AttributeError):
                pass

        # Check for lastModified if available
        if modified := metadata.get("lastModified"):
            try:
                updated = (
                    datetime.fromisoformat(modified.rstrip("Z")).date().isoformat()
                )
            except (ValueError, AttributeError):
                pass

        return created, updated

    async def _scrape_url_async(self, url: str) -> Dict[str, Any]:
        """Asynchronously scrape a single URL with exponential backoff retry logic"""
        attempts = 0
        last_error = None

        while attempts < self.max_retries:
            attempts += 1
            try:
                if self.verbose:
                    if attempts > 1:
                        logger.info("Retry #%d for URL: %s", attempts, url)
                    else:
                        logger.info("Scraping URL: %s", url)

                # Try to scrape the URL
                scraped_data = self.firecrawl.scrape_url(
                    url,
                    params={"formats": ["markdown"]},
                )

                # Extract metadata
                metadata = scraped_data.get("metadata", {})
                created_date, updated_date = self._extract_dates(metadata)

                if self.verbose:
                    logger.info("Successfully scraped: %s", url)

                return {
                    "success": True,
                    "url": url,
                    "title": scraped_data.get("title", ""),
                    "content": scraped_data.get("markdown", "")[:6000],
                    "metadata": metadata,
                    "detected_dates": {
                        "created": created_date,
                        "updated": updated_date,
                    },
                }
            except Exception as e:
                last_error = str(e)
                if self.verbose:
                    logger.warning(
                        "Error scraping %s (attempt %d/%d): %s",
                        url,
                        attempts,
                        self.max_retries,
                        last_error,
                    )

                # If more retries are left, wait before trying again with exponential backoff
                if attempts < self.max_retries:
                    # Calculate exponential backoff delay: initial_delay * 2^(attempt-1)
                    delay = self.initial_retry_delay * (2 ** (attempts - 1))
                    if self.verbose:
                        logger.info(
                            "Waiting %d seconds before retry (exponential backoff)...",
                            delay,
                        )
                    await asyncio.sleep(delay)

        # If we get here, all retries failed
        if self.verbose:
            logger.error("Failed to scrape %s after %d attempts", url, self.max_retries)
        return {"success": False, "url": url, "error": last_error, "attempts": attempts}

    async def scrape_multiple_urls(self, urls: List[str]) -> List[Dict[str, Any]]:
        """Scrape multiple URLs concurrently with progress bar"""
        if self.verbose:
            logger.info("Starting to scrape %d URLs...", len(urls))

        tasks = []
        for url in urls:
            tasks.append(self._scrape_url_async(url))

        # Use tqdm to show progress
        results = []
        for task in async_tqdm.as_completed(
            tasks, desc="Scraping URLs", total=len(tasks)
        ):
            results.append(await task)

        if self.verbose:
            successful = sum(1 for r in results if r.get("success", False))
            logger.info("Completed scraping: %d/%d successful", successful, len(urls))

        return results

    def _prepare_batch_prompt(self, scraped_data_list: List[Dict[str, Any]]) -> str:
        """Prepare a batch prompt for the LLM to classify multiple pages at once"""
        pages_json = []
        for data in scraped_data_list:
            if data.get("success", False):
                pages_json.append(
                    {
                        "url": data["url"],
                        "title": data["title"],
                        "content_preview": data["content"][:1000] + "..."
                        if len(data["content"]) > 1000
                        else data["content"],
                        "detected_dates": data["detected_dates"],
                    }
                )

        return json.dumps(pages_json, indent=2)

    async def _analyze_batch_with_llm_async(
        self, scraped_data_list: List[Dict[str, Any]]
    ) -> Dict[str, Dict]:
        """Use LiteLLM to analyze multiple pages at once (async version) with exponential backoff retry logic"""
        # Filter out failed scrapes
        successful_scrapes = [
            data for data in scraped_data_list if data.get("success", False)
        ]

        if not successful_scrapes:
            if self.verbose:
                logger.warning("No successful scrapes to analyze")
            return {}

        if self.verbose:
            logger.info("Analyzing %d pages with LLM...", len(successful_scrapes))

        batch_prompt = self._prepare_batch_prompt(successful_scrapes)

        messages = [
            {
                "role": "system",
                "content": """You're a sophisticated webpage classifier that can analyze multiple pages at once.
                For each page in the array, analyze the content and URL to determine:

                1. classification (choose one per page: privacy_policy, terms_of_service, cookie_policy, legal_document, other)
                2. dates.creation (ISO format or null)
                3. dates.update (ISO format or null)
                4. confidence_score (0.0-1.0)
                5. key_topics (array of topics)
                6. language (ISO code)

                For classification if the document is not a privacy policy, terms of service, cookie policy but is related to legal documents (GDPR, CCPA, Policies, etc.) then classify it as legal_document. Otherwise classify it as other.
                The dates can be extracted from the url, metadata or the content.

                Return a JSON object where keys are URLs and values are classification objects.
                """,
            },
            {"role": "user", "content": batch_prompt},
        ]

        # LLM call with exponential backoff retry logic
        attempts = 0
        last_error = None

        while attempts < self.max_retries:
            attempts += 1
            try:
                if self.verbose:
                    if attempts > 1:
                        logger.info("LLM retry attempt #%d", attempts)
                    else:
                        logger.info("Sending request to LLM...")

                response = completion(
                    model=self.llm_model,
                    messages=messages,
                    response_format={"type": "json_object"},
                    temperature=0.1,
                    max_tokens=4000,  # Increased for batch processing
                )

                if self.verbose:
                    logger.info("LLM response received")

                return json.loads(response.choices[0].message.content)

            except Exception as e:
                last_error = str(e)
                if self.verbose:
                    logger.warning(
                        "Error in LLM analysis (attempt %d/%d): %s",
                        attempts,
                        self.max_retries,
                        last_error,
                    )

                # If more retries are left, wait before trying again with exponential backoff
                if attempts < self.max_retries:
                    # Calculate exponential backoff delay: initial_delay * 2^(attempt-1)
                    delay = self.initial_retry_delay * (2 ** (attempts - 1))
                    if self.verbose:
                        logger.info(
                            "Waiting %d seconds before LLM retry (exponential backoff)...",
                            delay,
                        )
                    await asyncio.sleep(delay)

        # If we get here, all retries failed
        if self.verbose:
            logger.error("Failed LLM analysis after %d attempts", self.max_retries)
        return {}

    async def classify_pages_async(self, urls: List[str]) -> Dict[str, Dict]:
        """Classify multiple pages in one batch (async version)"""
        if self.verbose:
            logger.info("Starting classification of %d URLs", len(urls))

        # Scrape all URLs
        scraped_data_list = await self.scrape_multiple_urls(urls)

        # Classify all scraped data in one LLM call
        classifications = await self._analyze_batch_with_llm_async(scraped_data_list)

        # Enrich with metadata
        results = {}
        if self.verbose:
            logger.info("Processing classification results...")

        for data in scraped_data_list:
            url = data["url"]
            if not data.get("success", False):
                results[url] = {
                    "error": data.get("error", "Unknown error"),
                    "success": False,
                    "url": url,
                    "attempts": data.get("attempts", 1),
                }
                continue

            if url in classifications:
                results[url] = {
                    **classifications[url],
                    "url": url,
                    "firecrawl_metadata": data.get("metadata", {}),
                    "source": "firecrawl+litellm",
                    "timestamps": {"retrieved_at": datetime.utcnow().isoformat()},
                    "success": True,
                }
            else:
                results[url] = {
                    "error": "LLM classification failed",
                    "success": False,
                    "url": url,
                }

        if self.verbose:
            successful = sum(1 for r in results.values() if r.get("success", False))
            logger.info(
                "Classification complete: %d/%d successfully classified",
                successful,
                len(urls),
            )

        return results

    async def classify_page_async(self, url: str) -> Dict[str, Any]:
        """Async version of classify_page"""
        if self.verbose:
            logger.info("Classifying single URL: %s", url)

        result = await self.classify_pages_async([url])
        return result.get(
            url, {"error": "Classification failed", "success": False, "url": url}
        )

    async def classify_pages(self, urls: List[str]) -> Dict[str, Dict]:
        """Synchronous wrapper for classify_pages_async"""
        return await self.classify_pages_async(urls)

    async def classify_page(self, url: str) -> Dict[str, Any]:
        """Synchronous wrapper for classify_page_async"""
        return await self.classify_page_async(url)
