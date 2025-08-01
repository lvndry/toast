"""
Legal document crawler for extracting privacy policies, terms of service, and other legal content.
"""

import asyncio
import heapq
import re
import time
from collections import deque
from typing import Any, Dict, List, Optional, Set, Tuple
from urllib.parse import urljoin, urlparse, urlunparse

import aiohttp
import markdownify  # type: ignore
from bs4 import BeautifulSoup
from loguru import logger
from pydantic import BaseModel, Field


class CrawlResult(BaseModel):
    """Container for crawl results."""

    url: str
    title: str
    content: str
    markdown: str
    metadata: Dict[str, Any]
    status_code: int
    success: bool
    error_message: Optional[str] = None
    legal_score: float = 0.0
    discovered_urls: List[str] = Field(default_factory=list)


class CrawlStats(BaseModel):
    """Crawl statistics."""

    total_urls: int = 0
    crawled_urls: int = 0
    failed_urls: int = 0
    legal_documents_found: int = 0
    start_time: float = Field(default_factory=time.time)

    @property
    def elapsed_time(self) -> float:
        return time.time() - self.start_time

    @property
    def crawl_rate(self) -> float:
        return self.crawled_urls / self.elapsed_time if self.elapsed_time > 0 else 0


class URLScorer:
    """Scores URLs based on legal document relevance."""

    def __init__(self):
        self.legal_keywords = {
            # Generic legal terms
            "legal": 3.5,
            "terms": 4.0,
            "privacy": 5.0,
            "policy": 4.0,
            "agreement": 3.5,
            "conditions": 3.5,
            "disclaimer": 3.0,
            "notice": 2.5,
            "consent": 3.0,
            "rights": 2.5,
            "compliance": 3.0,
            "trust": 2.0,
            "rules": 2.5,
            "license": 3.0,
            # Specific document types
            "privacy-policy": 5.0,
            "terms-of-service": 5.0,
            "terms-and-conditions": 5.0,
            "terms-of-use": 5.0,
            "cookie-policy": 4.5,
            "cookie": 3.5,
            "cookies": 3.5,
            # Data and processing
            "data": 3.0,
            "processor": 3.5,
            "subprocessor": 3.5,
            "partners": 2.0,
            "processing": 3.0,
            "protection": 3.5,
            "addendum": 4.5,  # Added for DPAs
            "dpa": 5.0,  # Data Processing Agreement
            "subprocessors": 3.5,
            # Regional and compliance
            "gdpr": 4.0,
            "ccpa": 4.0,
            "hipaa": 4.0,
            "coppa": 4.0,
            "pipeda": 4.0,
            # Security and safety
            "security": 3.0,
            "safety": 3.0,
            "copyright": 3.0,
            "dmca": 3.5,
            # Additional legal terms
            "vendor": 2.5,
            "suppliers": 2.5,
            "associate": 2.0,
            "transparency": 3.0,
            "report": 2.0,
            "company": 1.0,
            # Negative keywords (reduce score)
            "blog": -1.0,
            "news": -1.0,
            "product": -0.5,
            "help": -0.5,
            "contact": -0.5,
            "about": -0.5,
        }

        self.path_patterns = {
            r"/legal/?": 4.0,
            r"/terms/?": 4.5,
            r"/tos/?": 4.5,
            r"/privacy/?": 5.0,
            r"/policy/?": 4.0,
            r"/policies/?": 4.0,
            r"/agreement/?": 3.5,
            r"/compliance/?": 3.5,
            r"/cookie/?": 4.0,
            r"/gdpr/?": 4.5,
            r"/ccpa/?": 4.5,
            r"/data-processing/?": 4.0,
            r"/security/?": 3.0,
            r"/disclaimer/?": 3.0,
            r"/company/?": 3.0,
            # Enhanced patterns for DPAs and similar documents
            r"/data-processing-addendum/?": 5.0,
            r"/dpa/?": 5.0,
            r"/addendum/?": 4.5,
            r"/subprocessors/?": 4.0,
            r"/vendors/?": 3.0,
            r"/suppliers/?": 3.0,
            r"/transparency/?": 3.5,
            # Pattern for UUID-based URLs that might be legal documents
            r"/[a-f0-9-]{32,}": 2.0,  # Boost UUID-like paths slightly
            # Additional patterns for common legal document structures
            r"/company/legal/?": 5.0,
            r"/company/privacy/?": 5.0,
            r"/company/terms/?": 5.0,
            r"/company/tos/?": 5.0,
            r"/about/legal/?": 4.5,
            r"/about/privacy/?": 4.5,
            r"/about/terms/?": 4.5,
            r"/about/tos/?": 4.5,
            r"/support/legal/?": 4.0,
            r"/support/privacy/?": 4.0,
            r"/support/terms/?": 4.0,
            r"/help/legal/?": 4.0,
            r"/help/privacy/?": 4.0,
            r"/help/terms/?": 4.0,
            r"/policies/privacy/?": 5.0,
            r"/policies/terms/?": 5.0,
            r"/policies/cookies/?": 4.5,
            r"/legal/policies/?": 5.0,
            r"/legal/policies/privacy/?": 5.0,
            r"/legal/policies/terms/?": 5.0,
            r"/legal/policies/cookies/?": 4.5,
        }

        # High-value legal document patterns that should get maximum score
        self.high_value_patterns = {
            r"privacy-policy": 8.0,
            r"terms-of-service": 8.0,
            r"cookie-policy": 7.0,
            r"data-processing-addendum": 8.0,
            r"subprocessors": 6.0,
            r"gdpr": 6.0,
            r"ccpa": 6.0,
        }

    def score_url(self, url: str) -> float:
        """Score a URL based on legal document relevance."""
        parsed = urlparse(url.lower())
        path = parsed.path

        score = 0.0

        # Check high-value patterns first
        for pattern, weight in self.high_value_patterns.items():
            if re.search(pattern, url.lower()):
                score += weight

        # Score based on path patterns
        for pattern, weight in self.path_patterns.items():
            if re.search(pattern, path):
                score += weight

        # Score based on keyURLwords in
        url_text = (
            f"{path} {parsed.query} {parsed.fragment}".replace("/", " ")
            .replace("-", " ")
            .replace("_", " ")
        )
        words = re.findall(r"\b\w+\b", url_text)

        for word in words:
            if word in self.legal_keywords:
                score += self.legal_keywords[word]

        return max(0.0, score)


class ContentAnalyzer:
    """Analyzes page content for legal document characteristics."""

    def __init__(self):
        self.legal_indicators = [
            "terms of service",
            "privacy policy",
            "cookie policy",
            "data protection",
            "personal information",
            "third parties",
            "we collect",
            "your rights",
            "lawful basis",
            "consent",
            "legitimate interest",
            "data controller",
            "data processor",
            "retention period",
            "delete your data",
            "opt out",
            "agreement",
            "binding",
            "governing law",
            "jurisdiction",
            "liability",
            "disclaimer",
            "limitation of liability",
            "indemnification",
            "intellectual property",
            "copyright",
            "trademark",
            "infringement",
            "compliance",
            "regulatory",
            "gdpr",
            "ccpa",
            "hipaa",
            "coppa",
            # Enhanced indicators for DPAs and similar documents
            "data processing addendum",
            "dpa",
            "subprocessor",
            "subprocessors",
            "sub-processor",
            "sub-processors",
            "vendor",
            "suppliers",
            "third party service provider",
            "service provider",
            "data transfer",
            "international transfer",
            "adequacy decision",
            "standard contractual clauses",
            "scc",
            "binding corporate rules",
            "bcr",
            "data subject rights",
            "data security",
            "data breach",
            "processing activities",
            "personal data",
            "special categories",
            "sensitive data",
            "transparency report",
        ]

        self.legal_phrases = [
            r"by using (?:this|our) (?:service|website|platform)",
            r"you agree to (?:these|our) terms",
            r"we (?:collect|process|use) your (?:personal )?(?:data|information)",
            r"this policy (?:describes|explains) how we",
            r"we may (?:update|modify|change) this policy",
            r"your (?:privacy|data|personal information) is important",
            r"we are committed to protecting your privacy",
            r"cookies (?:are|help us)",
            r"you have the right to",
            r"data retention period",
            r"lawful basis for processing",
            # Enhanced phrases for DPAs and compliance documents
            r"data processing addendum",
            r"this addendum (?:forms|supplements|amends)",
            r"subprocessor(?:s)? (?:list|agreement)",
            r"we (?:engage|use) (?:third.party|sub.?processor)",
            r"processing (?:activities|operations|purposes)",
            r"data subject (?:rights|requests)",
            r"cross.border (?:transfer|data transfer)",
            r"adequacy decision",
            r"standard contractual clauses",
            r"security (?:measures|safeguards|controls)",
            r"data (?:breach|incident) (?:notification|response)",
            r"controller (?:and|to) processor",
            r"processor (?:instructions|obligations)",
        ]

    def analyze_content(
        self, content: str, title: str = "", metadata: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, float, List[str]]:
        """
        Analyze content to determine if it's a legal document.

        Returns:
            Tuple of (is_legal, confidence_score, matched_indicators)
        """
        if not content:
            return False, 0.0, []

        content_lower = content.lower()
        title_lower = title.lower() if title else ""

        matched_indicators = []
        raw_score = 0.0

        # Calculate content metrics
        word_count = len(content.split())
        char_count = len(content)

        # Minimum content thresholds to avoid tiny snippets
        if word_count < 50 or char_count < 300:
            return False, 0.0, ["content_too_short"]

        # Track matched content for density calculation
        matched_content_chars = 0

        # Check for legal indicators in content
        for indicator in self.legal_indicators:
            if indicator in content_lower:
                matched_indicators.append(indicator)
                raw_score += 1.0
                # Add to matched content length
                matched_content_chars += len(indicator) * content_lower.count(indicator)

        # Check for legal phrases using regex
        for phrase_pattern in self.legal_phrases:
            matches = re.finditer(phrase_pattern, content_lower)
            for match in matches:
                matched_indicators.append(phrase_pattern)
                raw_score += 2.0
                matched_content_chars += len(match.group())

        # Calculate legal content density
        legal_density = matched_content_chars / char_count

        # Bonus for legal terms in title (more important)
        title_keywords = [
            "terms",
            "privacy",
            "policy",
            "cookie",
            "legal",
            "agreement",
            "data",
            "gdpr",
        ]
        title_bonus = 0.0
        for keyword in title_keywords:
            if keyword in title_lower:
                title_bonus += 3.0
                matched_indicators.append(f"title:{keyword}")

        # Check metadata
        metadata_bonus = 0.0
        if metadata:
            meta_title = metadata.get("title", "").lower()
            meta_description = metadata.get("description", "").lower()

            for text in [meta_title, meta_description]:
                for keyword in title_keywords:
                    if keyword in text:
                        metadata_bonus += 1.0

        # Combined scoring with density weighting
        base_score = raw_score * legal_density * 100  # Scale density
        final_score = base_score + title_bonus + metadata_bonus

        # Normalize to 0-10 scale
        normalized_score = min(10.0, final_score)

        # More sophisticated thresholds
        min_density_threshold = 0.05  # At least 5% of content should be legal-related
        min_score_threshold = 2.0

        # Document is legal if:
        # 1. Has sufficient legal density (5%+)
        # 2. Meets minimum score threshold
        # 3. OR has strong title indicators (overrides density for short legal docs)
        is_legal = (
            (
                legal_density >= min_density_threshold
                and normalized_score >= min_score_threshold
            )
            or title_bonus >= 6.0  # Strong title indicators
        )

        # Add density information to indicators for debugging
        matched_indicators.append(f"density:{legal_density:.3f}")
        matched_indicators.append(f"word_count:{word_count}")

        return is_legal, normalized_score, matched_indicators


class RobotsTxtChecker:
    """Checks robots.txt compliance with improved parsing."""

    def __init__(self):
        self.robots_cache: Dict[str, Dict[str, Any]] = {}
        self.user_agent = "ToastCrawler/2.0"
        # Common user agent patterns that should be treated as wildcards
        self.user_agent_patterns = [
            "*",  # Standard wildcard
            "all",  # Common alias
            "any",  # Common alias
            "bot",  # Generic bot identifier
            "crawler",  # Generic crawler identifier
            "spider",  # Generic spider identifier
            "robot",  # Generic robot identifier
            "crawl",  # Common prefix
            "spider",  # Common prefix
            "bot",  # Common suffix
        ]

    async def can_fetch(
        self, session: aiohttp.ClientSession, url: str
    ) -> Tuple[bool, str]:
        """Check if URL can be fetched according to robots.txt."""
        try:
            parsed = urlparse(url)
            base_url = f"{parsed.scheme}://{parsed.netloc}"
            robots_url = f"{base_url}/robots.txt"

            if base_url not in self.robots_cache:
                try:
                    # Fetch robots.txt content directly
                    timeout = aiohttp.ClientTimeout(total=10)
                    async with session.get(robots_url, timeout=timeout) as response:
                        if response.status == 200:
                            robots_content = await response.text()
                            logger.debug(f"Fetched robots.txt from {robots_url}")
                            self.robots_cache[base_url] = self._parse_robots_txt(
                                robots_content
                            )
                        else:
                            logger.debug(
                                f"Could not fetch robots.txt from {robots_url} (status: {response.status})"
                            )
                            # If we can't fetch robots.txt, allow all
                            self.robots_cache[base_url] = {"allow_all": True}
                except Exception as e:
                    logger.debug(f"Error fetching robots.txt from {robots_url}: {e}")
                    # If we can't fetch robots.txt, allow all
                    self.robots_cache[base_url] = {"allow_all": True}

            robots_rules = self.robots_cache[base_url]
            if robots_rules.get("allow_all", False):
                logger.debug(f"No robots.txt rules for {base_url}, allowing access")
                return True, "No robots.txt rules found"

            return self._check_url_allowed(url, robots_rules)

        except Exception as e:
            logger.warning(f"Error checking robots.txt for {url}: {e}")
            return True, f"Error checking robots.txt: {str(e)}"

    def _parse_robots_txt(self, content: str) -> Dict[str, Any]:
        """Parse robots.txt content into rules following the standard format."""
        lines = [line.strip() for line in content.split("\n") if line.strip()]
        logger.debug(f"Parsing robots.txt with {len(lines)} lines")

        user_agents: Dict[str, Dict[str, List[str]]] = {}
        current_user_agent = None

        for line in lines:
            # Skip comments and empty lines
            if line.startswith("#") or not line:
                continue

            # Handle line continuation
            if line.startswith(" ") or line.startswith("\t"):
                if current_user_agent:
                    # Append to the last rule
                    last_rule_type = list(user_agents[current_user_agent].keys())[-1]
                    user_agents[current_user_agent][last_rule_type][-1] += line.strip()
                continue

            # Parse directive
            if ":" in line:
                directive, value = line.split(":", 1)
                directive = directive.strip().lower()
                value = value.strip()

                if directive == "user-agent":
                    current_user_agent = value.lower()
                    if current_user_agent not in user_agents:
                        user_agents[current_user_agent] = {"disallow": [], "allow": []}
                    logger.debug(f"Found user-agent: {current_user_agent}")
                elif directive == "disallow" and current_user_agent:
                    if value:  # Only add non-empty disallow rules
                        user_agents[current_user_agent]["disallow"].append(value)
                        logger.debug(
                            f"Added disallow rule for {current_user_agent}: {value}"
                        )
                elif directive == "allow" and current_user_agent:
                    user_agents[current_user_agent]["allow"].append(value)
                    logger.debug(f"Added allow rule for {current_user_agent}: {value}")
                elif directive == "crawl-delay" and current_user_agent:
                    # Store crawl delay for rate limiting
                    try:
                        delay = float(value)
                        user_agents[current_user_agent]["crawl_delay"] = delay  # type: ignore
                        logger.debug(
                            f"Added crawl-delay for {current_user_agent}: {delay}"
                        )
                    except ValueError:
                        logger.warning(f"Invalid crawl-delay value: {value}")

        return {"user_agents": user_agents}

    def _check_url_allowed(
        self, url: str, robots_rules: Dict[str, Any]
    ) -> Tuple[bool, str]:
        """Check if URL is allowed based on parsed robots.txt rules."""
        parsed = urlparse(url)
        path = parsed.path
        if not path:
            path = "/"

        user_agents = robots_rules.get("user_agents", {})
        logger.debug(f"Checking rules for URL: {url} (path: {path})")

        # Find applicable rules by checking user agent patterns
        applicable_rules = None
        matched_user_agent = None
        user_agent_lower = self.user_agent.lower()

        # First check exact match
        if user_agent_lower in user_agents:
            applicable_rules = user_agents[user_agent_lower]
            matched_user_agent = user_agent_lower
            logger.debug(f"Found exact user-agent match: {user_agent_lower}")
        # Then check wildcard patterns
        else:
            for pattern in self.user_agent_patterns:
                if pattern in user_agents:
                    applicable_rules = user_agents[pattern]
                    matched_user_agent = pattern
                    logger.debug(f"Found wildcard user-agent match: {pattern}")
                    break

        # If no rules found, allow by default
        if not applicable_rules:
            return True, "No matching rules found"

        logger.debug(f"Using rules for user-agent: {matched_user_agent}")

        # Check allow rules first (most specific wins)
        for allow_pattern in applicable_rules.get("allow", []):
            if self._path_matches_pattern(path, allow_pattern):
                logger.debug(f"URL allowed by pattern: {allow_pattern}")
                return True, f"Explicitly allowed by pattern: {allow_pattern}"

        # Then check disallow rules
        for disallow_pattern in applicable_rules.get("disallow", []):
            if self._path_matches_pattern(path, disallow_pattern):
                # If we have a matching disallow rule, check if there's a more specific allow rule
                for allow_pattern in applicable_rules.get("allow", []):
                    if self._path_matches_pattern(path, allow_pattern) and len(
                        allow_pattern
                    ) > len(disallow_pattern):
                        logger.debug(
                            f"URL allowed by more specific pattern: {allow_pattern} (overrides {disallow_pattern})"
                        )
                        return (
                            True,
                            f"Allowed by more specific pattern: {allow_pattern}",
                        )
                return False, f"Blocked by pattern: {disallow_pattern}"

        # If we have disallow rules but no match, default behavior depends on allow rules
        if applicable_rules.get("disallow"):
            # If there are any allow rules, default is to disallow unless explicitly allowed
            if applicable_rules.get("allow"):
                return False, "Default disallow with allow rules present"
            else:
                # Only disallow rules exist, so allow anything not explicitly disallowed
                return True, "No matching disallow rules"

        # No rules or only allow rules - default is to allow
        return True, "No blocking rules found"

    def _path_matches_pattern(self, path: str, pattern: str) -> bool:
        """Check if path matches robots.txt pattern following standard rules."""
        if not pattern:
            return False
        if pattern == "/":
            return True  # Allow: / means allow everything

        # Handle wildcards
        if "*" in pattern:
            # Convert pattern to regex
            regex_pattern = pattern.replace(".", "\\.").replace("*", ".*")
            return bool(re.match(f"^{regex_pattern}$", path))

        # Handle trailing wildcard
        if pattern.endswith("*"):
            return path.startswith(pattern[:-1])

        # Handle leading wildcard
        if pattern.startswith("*"):
            return path.endswith(pattern[1:])

        # Exact match
        return path.startswith(pattern)


class ToastCrawler:
    """Powerful legal document crawler."""

    def __init__(
        self,
        max_depth: int = 3,
        max_pages: int = 1000,
        max_concurrent: int = 10,
        delay_between_requests: float = 1.0,
        timeout: int = 30,
        allowed_domains: Optional[List[str]] = None,
        respect_robots_txt: bool = True,
        user_agent: str = "ToastCrawler/2.0 (Legal Document Discovery Bot; website coming soon)",
        follow_external_links: bool = False,
        min_legal_score: float = 2.0,
        strategy: str = "bfs",  # "bfs", "dfs", "best_first"
        ignore_robots_for_domains: List[str]
        | None = None,  # List of domains to ignore robots.txt for
    ):
        """
        Initialize the ToastCrawler.

        Args:
            max_depth: Maximum crawl depth
            max_pages: Maximum number of pages to crawl
            max_concurrent: Maximum concurrent requests
            delay_between_requests: Delay between requests in seconds
            timeout: Request timeout in seconds
            allowed_domains: List of allowed domains (None = allow all)
            respect_robots_txt: Whether to respect robots.txt
            user_agent: User agent string
            follow_external_links: Whether to follow external links
            min_legal_score: Minimum score to consider a URL legal-relevant
            strategy: Crawling strategy ("bfs", "dfs", "best_first")
            ignore_robots_for_domains: List of domains to ignore robots.txt for
        """
        self.max_depth = max_depth
        self.max_pages = max_pages
        self.max_concurrent = max_concurrent
        self.delay_between_requests = delay_between_requests
        self.timeout = timeout
        self.allowed_domains: Optional[Set[str]] = (
            set(allowed_domains) if allowed_domains else None
        )
        self.respect_robots_txt = respect_robots_txt
        self.user_agent = user_agent
        self.follow_external_links = follow_external_links
        self.min_legal_score = min_legal_score
        self.strategy = strategy
        self.ignore_robots_for_domains = set(ignore_robots_for_domains or [])

        # Components
        self.url_scorer = URLScorer()
        self.content_analyzer = ContentAnalyzer()
        self.robots_checker = RobotsTxtChecker() if respect_robots_txt else None

        # State
        self.visited_urls: Set[str] = set()
        self.failed_urls: Set[str] = set()
        self.url_queue: deque[Tuple[str, int]] = deque()  # For BFS
        self.url_stack: List[Tuple[str, int]] = []  # For DFS
        self.url_priority_queue: List[
            Tuple[float, str, int]
        ] = []  # For best-first (scored URLs)
        self.results: List[CrawlResult] = []
        self.stats = CrawlStats()

        # Rate limiting
        self.last_request_time = 0.0
        self.request_lock = asyncio.Lock()

    def normalize_url(self, url: str) -> str:
        """Normalize URL by removing fragments and unnecessary query params."""
        parsed = urlparse(url)

        # Remove fragment
        normalized = urlunparse(
            (
                parsed.scheme,
                parsed.netloc,
                parsed.path,
                parsed.params,
                parsed.query,
                "",  # Remove fragment
            )
        )

        # Remove trailing slash for consistency
        if normalized.endswith("/") and len(parsed.path) > 1:
            normalized = normalized[:-1]

        return normalized

    def is_allowed_domain(self, url: str) -> bool:
        """Check if URL domain is allowed."""
        if not self.allowed_domains:
            return True

        parsed = urlparse(url)
        domain = parsed.netloc.lower()

        # Remove www prefix for comparison
        if domain.startswith("www."):
            domain = domain[4:]

        # Check if domain matches any allowed domain
        return any(
            domain == allowed.lower().removeprefix("www.")
            or domain.endswith("." + allowed.lower().removeprefix("www."))
            for allowed in (self.allowed_domains or set())
        )

    def is_same_domain(self, url1: str, url2: str) -> bool:
        """Check if two URLs are from the same domain."""
        domain1 = urlparse(url1).netloc.lower().removeprefix("www.")
        domain2 = urlparse(url2).netloc.lower().removeprefix("www.")

        return domain1 == domain2

    def should_crawl_url(self, url: str, base_url: str, depth: int) -> bool:
        """Determine if URL should be crawled."""
        if depth > self.max_depth:
            logger.debug(
                f"❌ URL {url} rejected: depth {depth} > max_depth {self.max_depth}"
            )
            return False

        if url in self.visited_urls or url in self.failed_urls:
            logger.debug(f"❌ URL {url} rejected: already visited or failed")
            return False

        if not self.is_allowed_domain(url):
            logger.debug(f"❌ URL {url} rejected: domain not allowed")
            return False

        if not self.follow_external_links and not self.is_same_domain(url, base_url):
            logger.debug(
                f"❌ URL {url} rejected: external link and follow_external_links=False"
            )
            return False

        # Skip common non-content URLs
        skip_patterns = [
            r"\.(?:pdf|jpg|jpeg|png|gif|css|js|ico|xml)$",
            r"#",  # Skip anchor links
            r"mailto:",
            r"tel:",
            r"javascript:",
            r"/search\?",
            r"/api/",
            r"/ajax/",
        ]

        for pattern in skip_patterns:
            if re.search(pattern, url, re.IGNORECASE):
                logger.debug(f"❌ URL {url} rejected: matches skip pattern {pattern}")
                return False

        logger.debug(f"✅ URL {url} accepted for crawling at depth {depth}")
        return True

    def extract_links(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """Extract links from HTML."""
        links = []

        for link in soup.find_all("a", href=True):
            if hasattr(link, "get"):
                href_attr = link.get("href")
                if href_attr:
                    href = str(href_attr).strip()
                    if not href:
                        continue

                    # Convert relative URLs to absolute
                    absolute_url = urljoin(base_url, href)
                    normalized_url = self.normalize_url(absolute_url)

                    links.append(normalized_url)

        # Remove duplicates and log discovered links
        unique_links = list(set(links))
        logger.debug(f"🔗 Discovered {len(unique_links)} unique links from {base_url}")
        for link in unique_links[:10]:  # Log first 10 links
            logger.debug(f"  - {link}")
        if len(unique_links) > 10:
            logger.debug(f"  ... and {len(unique_links) - 10} more links")

        return unique_links

    def extract_metadata(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract metadata from HTML."""
        metadata: Dict[str, Any] = {}

        # Title
        title_tag = soup.find("title")
        if title_tag:
            metadata["title"] = title_tag.get_text().strip()

        # Meta tags
        for meta in soup.find_all("meta"):
            if hasattr(meta, "get"):
                name = (
                    meta.get("name") or meta.get("property") or meta.get("http-equiv")
                )
                content = meta.get("content")

                if name and content and isinstance(name, str):
                    metadata[name.lower()] = content

        # Headers
        for i in range(1, 7):
            headers = soup.find_all(f"h{i}")
            if headers:
                metadata[f"h{i}"] = [
                    h.get_text().strip() for h in headers[:5]
                ]  # First 5

        return metadata

    async def rate_limit(self):
        """Apply rate limiting."""
        async with self.request_lock:
            elapsed = time.time() - self.last_request_time
            if elapsed < self.delay_between_requests:
                await asyncio.sleep(self.delay_between_requests - elapsed)
            self.last_request_time = time.time()

    async def fetch_page(self, session: aiohttp.ClientSession, url: str) -> CrawlResult:
        """Fetch and process a single page."""
        await self.rate_limit()

        try:
            # Check if we should ignore robots.txt for this domain
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            if domain.startswith("www."):
                domain = domain[4:]

            should_check_robots = (
                self.respect_robots_txt and domain not in self.ignore_robots_for_domains
            )

            # Check robots.txt
            if should_check_robots and self.robots_checker:
                is_allowed, reason = await self.robots_checker.can_fetch(session, url)
                if not is_allowed:
                    logger.warning(
                        f"URL blocked by robots.txt: {url} - Reason: {reason}"
                    )
                    return CrawlResult(
                        url=url,
                        title="",
                        content="",
                        markdown="",
                        metadata={},
                        status_code=403,
                        success=False,
                        error_message=f"Blocked by robots.txt: {reason}",
                    )

            timeout = aiohttp.ClientTimeout(total=self.timeout)
            headers = {"User-Agent": self.user_agent}

            async with session.get(url, timeout=timeout, headers=headers) as response:
                content_type = response.headers.get("content-type", "").lower()

                # Process both HTML and plain text content
                if "text/html" not in content_type and "text/plain" not in content_type:
                    return CrawlResult(
                        url=url,
                        title="",
                        content="",
                        markdown="",
                        metadata={},
                        status_code=response.status,
                        success=False,
                        error_message=f"Unsupported content type: {content_type}",
                    )

                text_response = await response.text()

                # Handle HTML content
                if "text/html" in content_type:
                    soup = BeautifulSoup(text_response, "html.parser")

                    # Extract data
                    title = soup.find("title")
                    title_text = title.get_text().strip() if title else ""

                    # Remove script and style elements
                    for script in soup(["script", "style"]):
                        script.decompose()

                    # Get text content
                    text_content = soup.get_text()
                    # Clean up whitespace
                    text_content = re.sub(r"\s+", " ", text_content).strip()

                    # Convert to markdown
                    markdown_content = markdownify.markdownify(
                        str(soup), heading_style="ATX"
                    )

                    # Extract metadata
                    metadata = self.extract_metadata(soup)

                    # Extract links
                    discovered_urls = self.extract_links(soup, url)

                # Handle plain text content
                elif "text/plain" in content_type:
                    # For plain text, use the content as-is
                    text_content = text_response.strip()

                    # Try to extract title from first line or URL
                    lines = text_content.split("\n")
                    title_text = ""

                    # Look for title indicators in first few lines
                    for line in lines[:5]:
                        line = line.strip()
                        if line and (
                            any(
                                keyword in line.lower()
                                for keyword in [
                                    "privacy",
                                    "terms",
                                    "policy",
                                    "agreement",
                                    "license",
                                    "legal",
                                    "notice",
                                ]
                            )
                            or len(line) < 100  # Short lines might be titles
                        ):
                            title_text = line
                            break

                    # Fallback: extract title from URL
                    if not title_text:
                        url_parts = url.rstrip("/").split("/")
                        if url_parts:
                            title_text = (
                                url_parts[-1]
                                .replace("-", " ")
                                .replace("_", " ")
                                .title()
                            )

                    # Use text content as markdown (it's already plain text)
                    markdown_content = text_content

                    # Basic metadata for plain text
                    metadata = {
                        "content-type": content_type,
                        "estimated_title": title_text,
                        "line_count": len(lines),
                        "character_count": len(text_content),
                    }

                    # No links can be extracted from plain text
                    discovered_urls = []

                # Analyze content for legal relevance (works for both HTML and plain text)
                is_legal, legal_score, indicators = (
                    self.content_analyzer.analyze_content(
                        text_content, title_text, metadata
                    )
                )

                if is_legal:
                    self.stats.legal_documents_found += 1

                return CrawlResult(
                    url=url,
                    title=title_text,
                    content=text_content,
                    markdown=markdown_content,
                    metadata=metadata,
                    status_code=response.status,
                    success=True,
                    legal_score=legal_score,
                    discovered_urls=discovered_urls,
                )
        except Exception as e:
            logger.error(f"Unexpected error fetching {url}: {e}")
            return CrawlResult(
                url=url,
                title="",
                content="",
                markdown="",
                metadata={},
                status_code=0,
                success=False,
                error_message=str(e),
            )

    def generate_potential_legal_urls(self, base_url: str) -> List[str]:
        """Generate potential legal document URLs based on common patterns."""
        parsed = urlparse(base_url)
        domain = parsed.netloc
        scheme = parsed.scheme

        # Common legal document paths
        legal_paths = [
            "/legal",
            "/legal/privacy",
            "/legal/terms",
            "/legal/cookies",
            "/legal/tos",
            "/privacy",
            "/privacy-policy",
            "/terms",
            "/terms-of-service",
            "/terms-of-use",
            "/tos",
            "/cookies",
            "/cookie-policy",
            "/legal/privacy-policy",
            "/legal/terms-of-service",
            "/legal/terms-of-use",
            "/legal/cookie-policy",
            "/company/legal",
            "/company/privacy",
            "/company/terms",
            "/company/tos",
            "/company/cookies",
            "/about/legal",
            "/about/privacy",
            "/about/terms",
            "/about/tos",
            "/support/legal",
            "/support/privacy",
            "/support/terms",
            "/help/legal",
            "/help/privacy",
            "/help/terms",
            "/policies",
            "/policies/privacy",
            "/policies/terms",
            "/policies/cookies",
            "/legal/policies",
            "/legal/policies/privacy",
            "/legal/policies/terms",
            "/legal/policies/cookies",
        ]

        # Generate URLs for each path
        potential_urls = []
        for path in legal_paths:
            url = f"{scheme}://{domain}{path}"
            potential_urls.append(url)

        return potential_urls

    def add_urls_to_queue(self, urls: List[str], base_url: str, depth: int):
        """Add URLs to the appropriate queue based on strategy."""
        for url in urls:
            if not self.should_crawl_url(url, base_url, depth + 1):
                continue

            if self.strategy == "bfs":
                self.url_queue.append((url, depth + 1))
                logger.debug(f"Added to BFS queue: {url} (depth: {depth + 1})")
            elif self.strategy == "dfs":
                self.url_stack.append((url, depth + 1))
                logger.debug(f"Added to DFS stack: {url} (depth: {depth + 1})")
            elif self.strategy == "best_first":
                score = self.url_scorer.score_url(url)
                heapq.heappush(self.url_priority_queue, (-score, url, depth + 1))
                logger.debug(f"Added to Best-First queue: {url} (score: {score:.2f})")

        # If we're at depth 0 (starting page), also add potential legal URLs
        if depth == 0:
            potential_legal_urls = self.generate_potential_legal_urls(base_url)
            logger.info(
                f"🔍 Generated {len(potential_legal_urls)} potential legal URLs"
            )

            for url in potential_legal_urls:
                if not self.should_crawl_url(url, base_url, 1):
                    continue

                if self.strategy == "bfs":
                    self.url_queue.append((url, 1))
                    logger.debug(f"Added potential legal URL to BFS queue: {url}")
                elif self.strategy == "dfs":
                    self.url_stack.append((url, 1))
                    logger.debug(f"Added potential legal URL to DFS stack: {url}")
                elif self.strategy == "best_first":
                    score = self.url_scorer.score_url(url)
                    heapq.heappush(self.url_priority_queue, (-score, url, 1))
                    logger.debug(
                        f"Added potential legal URL to Best-First queue: {url} (score: {score:.2f})"
                    )

    def get_next_url(self) -> Optional[Tuple[str, int]]:
        """Get next URL from queue based on strategy."""
        if self.strategy == "bfs" and self.url_queue:
            return self.url_queue.popleft()
        elif self.strategy == "dfs" and self.url_stack:
            return self.url_stack.pop()
        elif self.strategy == "best_first" and self.url_priority_queue:
            _, url, depth = heapq.heappop(self.url_priority_queue)
            return url, depth
        return None

    async def crawl(self, base_url: str) -> List[CrawlResult]:
        """
        Crawl starting from base URL.

        Args:
            base_url: Starting URL

        Returns:
            List of crawl results
        """
        logger.info(f"🕷️  Starting crawl from: {base_url}")
        logger.info(
            f"📊 Strategy: {self.strategy}, Max depth: {self.max_depth}, Max pages: {self.max_pages}"
        )

        # Initialize
        base_url = self.normalize_url(base_url)
        self.stats = CrawlStats()

        # Add base URL to queue
        if self.strategy == "bfs":
            self.url_queue.append((base_url, 0))
            logger.debug(f"Added base URL to BFS queue: {base_url} (depth: 0)")
        elif self.strategy == "dfs":
            self.url_stack.append((base_url, 0))
            logger.debug(f"Added base URL to DFS stack: {base_url} (depth: 0)")
        elif self.strategy == "best_first":
            score = self.url_scorer.score_url(base_url)
            heapq.heappush(self.url_priority_queue, (-score, base_url, 0))
            logger.debug(
                f"Added base URL to Best-First queue: {base_url} (score: {score:.2f})"
            )

        # Create session with connection pooling
        connector = aiohttp.TCPConnector(limit=self.max_concurrent)
        timeout = aiohttp.ClientTimeout(total=self.timeout)

        async with aiohttp.ClientSession(
            connector=connector, timeout=timeout
        ) as session:
            # Semaphore to limit concurrent requests
            semaphore = asyncio.Semaphore(self.max_concurrent)

            async def process_url(url: str, depth: int) -> CrawlResult:
                async with semaphore:
                    return await self.fetch_page(session, url)

            # Main crawl loop
            while len(self.visited_urls) < self.max_pages:
                # Get batch of URLs to process
                batch = []
                batch_size = min(
                    self.max_concurrent, self.max_pages - len(self.visited_urls)
                )

                for _ in range(batch_size):
                    next_item = self.get_next_url()
                    if next_item is None:
                        break
                    url, depth = next_item
                    if url not in self.visited_urls:
                        batch.append((url, depth))
                        self.visited_urls.add(url)

                if not batch:
                    break

                # Process batch concurrently
                tasks = [process_url(url, depth) for url, depth in batch]
                batch_results = await asyncio.gather(*tasks)

                # Process results
                for result, (url, depth) in zip(batch_results, batch):
                    self.stats.total_urls += 1

                    if result.success:
                        self.stats.crawled_urls += 1
                        self.results.append(result)

                        # Add discovered URLs to queue
                        if depth < self.max_depth:
                            self.add_urls_to_queue(
                                result.discovered_urls, base_url, depth
                            )

                        logger.info(
                            f"✅ [{self.stats.crawled_urls}/{self.max_pages}] "
                            f"{url} (Legal: {result.legal_score:.1f}) "
                            f"Found: {len(result.discovered_urls)} links"
                        )
                    else:
                        self.stats.failed_urls += 1
                        self.failed_urls.add(url)
                        logger.warning(f"❌ Failed: {url} - {result.error_message}")

                # Progress update
                if self.stats.crawled_urls % 10 == 0:
                    logger.info(
                        f"📊 Progress: {self.stats.crawled_urls} crawled, "
                        f"{self.stats.legal_documents_found} legal docs, "
                        f"{self.stats.crawl_rate:.1f} pages/sec"
                    )

        # Final statistics
        logger.success("🎉 Crawl completed!")
        logger.info(f"📊 Total URLs: {self.stats.total_urls}")
        logger.info(f"✅ Successfully crawled: {self.stats.crawled_urls}")
        logger.info(f"❌ Failed: {self.stats.failed_urls}")
        logger.info(f"⚖️  Legal documents found: {self.stats.legal_documents_found}")
        logger.info(f"⏱️  Total time: {self.stats.elapsed_time:.1f} seconds")
        logger.info(f"🚀 Average rate: {self.stats.crawl_rate:.1f} pages/sec")

        # Sort results by legal score (highest first)
        self.results.sort(key=lambda x: x.legal_score, reverse=True)

        return self.results

    async def crawl_multiple(self, urls: List[str]) -> List[CrawlResult]:
        """Crawl multiple base URLs."""
        all_results = []

        for i, url in enumerate(urls, 1):
            logger.info(f"🔄 Processing URL {i}/{len(urls)}: {url}")
            results = await self.crawl(url)
            all_results.extend(results)

            # Reset state for next URL
            self.visited_urls.clear()
            self.failed_urls.clear()
            self.url_queue.clear()
            self.url_stack.clear()
            self.url_priority_queue.clear()
            self.results.clear()

        return all_results


# Convenience functions
async def crawl_for_legal_documents(
    base_url: str,
    max_depth: int = 4,
    max_pages: int = 1000,
    strategy: str = "bfs",
) -> List[CrawlResult]:
    """
    Simple interface to crawl for legal documents.

    Args:
        base_url: Starting URL
        max_depth: Maximum crawl depth
        max_pages: Maximum pages to crawl
        strategy: Crawling strategy

    Returns:
        List of crawl results, sorted by legal relevance
    """
    crawler = ToastCrawler(
        max_depth=max_depth, max_pages=max_pages, strategy=strategy, min_legal_score=0.0
    )

    return await crawler.crawl(base_url)


async def test_specific_url(url: str) -> CrawlResult:
    """
    Test a specific URL to see how it scores and what content is extracted.

    Args:
        url: The URL to test

    Returns:
        CrawlResult for the specific URL
    """
    crawler = ToastCrawler(
        max_depth=1, max_pages=1, strategy="bfs", min_legal_score=0.0
    )

    # Test URL scoring
    url_score = crawler.url_scorer.score_url(url)
    logger.info(f"🔍 URL Score for {url}: {url_score}")

    # Create session and fetch the page
    connector = aiohttp.TCPConnector(limit=1)
    timeout = aiohttp.ClientTimeout(total=30)

    async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
        result = await crawler.fetch_page(session, url)

        # Log detailed analysis
        if result.success:
            logger.info(f"✅ Successfully fetched: {url}")
            logger.info(f"📄 Title: {result.title}")
            logger.info(f"⚖️ Legal Score: {result.legal_score}")
            logger.info(f"📊 Content Length: {len(result.content)} chars")
            logger.info(f"🔗 Discovered URLs: {len(result.discovered_urls)}")
        else:
            logger.error(f"❌ Failed to fetch: {url} - {result.error_message}")

    return result


# Example usage
async def main():
    """Example usage of the ToastCrawler."""
    import sys

    if len(sys.argv) < 2:
        logger.info(
            "Usage: python toast_crawler.py <base_url> [--test-url specific_url]"
        )
        return

    # Check if we're testing a specific URL
    if len(sys.argv) >= 4 and sys.argv[2] == "--test-url":
        specific_url = sys.argv[3]
        logger.info(f"🔍 Testing specific URL: {specific_url}")
        result = await test_specific_url(specific_url)

        logger.info("\n🎯 Test Result:")
        logger.info(f"📄 Title: {result.title or 'Untitled'}")
        logger.info(f"   URL: {result.url}")
        logger.info(f"   Success: {result.success}")
        logger.info(f"   Legal Score: {result.legal_score:.1f}")
        logger.info(f"   Content Length: {len(result.content)} chars")
        if not result.success:
            logger.info(f"   Error: {result.error_message}")
        return

    base_url = sys.argv[1]

    results = await crawl_for_legal_documents(
        base_url=base_url, max_depth=4, max_pages=200, strategy="bfs"
    )

    # Display all results with scores
    logger.info(f"\n📊 All crawled pages ({len(results)} total):")
    for i, result in enumerate(results, 1):
        logger.info(f"{i:3d}. {result.title or 'Untitled'[:50]}")
        logger.info(f"     URL: {result.url}")
        logger.info(f"     Legal Score: {result.legal_score:.1f}")
        logger.info("")

    # Display legal documents
    legal_docs = [r for r in results if r.legal_score >= 3.0]

    logger.info(f"\n🎯 Found {len(legal_docs)} potential legal documents:")
    for result in legal_docs:
        logger.info(f"📄 {result.title or 'Untitled'}")
        logger.info(f"   URL: {result.url}")
        logger.info(f"   Legal Score: {result.legal_score:.1f}")
        logger.info(f"   Content Length: {len(result.content)} chars")
        logger.info("")

    # Display moderate scoring pages that might be legal but scored lower
    moderate_docs = [r for r in results if 1.0 <= r.legal_score < 3.0]

    if moderate_docs:
        logger.info(
            f"\n📋 Found {len(moderate_docs)} pages with moderate legal scores:"
        )
        for result in moderate_docs[:10]:  # Top 10 moderate scoring
            logger.info(f"📄 {result.title or 'Untitled'}")
            logger.info(f"   URL: {result.url}")
            logger.info(f"   Legal Score: {result.legal_score:.1f}")
            logger.info("")


if __name__ == "__main__":
    asyncio.run(main())
