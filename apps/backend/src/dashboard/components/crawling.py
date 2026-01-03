import asyncio
import concurrent.futures
import time
from datetime import datetime
from pathlib import Path

import streamlit as st

from src.dashboard.db_utils import get_all_companies_isolated
from src.dashboard.utils import run_async, suppress_streamlit_warnings
from src.models.company import Company
from src.pipeline import LegalDocumentPipeline, ProcessingStats


def get_log_file_path(company: Company) -> Path:
    """Generate the log file path for a company crawl (matching the format used in LegalDocumentPipeline)."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_filename = f"{timestamp}_{company.slug}_crawl.log"
    return Path("logs") / log_filename


def find_most_recent_log_file(company: Company) -> Path | None:
    """Find the most recent log file for a company."""
    logs_dir = Path("logs")
    if not logs_dir.exists():
        return None

    # Find all log files for this company
    pattern = f"*_{company.slug}_crawl.log"
    log_files = list(logs_dir.glob(pattern))

    if not log_files:
        return None

    # Return the most recently modified file
    return max(log_files, key=lambda p: p.stat().st_mtime)


def read_log_file(log_file_path: Path | None) -> str:
    """Read the contents of a log file if it exists."""
    if not log_file_path or not log_file_path.exists():
        return ""
    try:
        return log_file_path.read_text(encoding="utf-8")
    except Exception as e:
        return f"Error reading log file: {str(e)}"


def read_log_file_tail(
    log_file_path: Path | None, last_position: int = 0, max_lines: int = 1000
) -> tuple[str, int]:
    """Read new content from a log file since last position (tail-like behavior).

    Limits output to the last max_lines to prevent exceeding maximum call size.

    Args:
        log_file_path: Path to the log file
        last_position: Last known position in the file
        max_lines: Maximum number of lines to return (default: 1000)

    Returns:
        Tuple of (new_content, new_position)
    """
    if not log_file_path or not log_file_path.exists():
        return "", last_position

    try:
        with open(log_file_path, encoding="utf-8") as f:
            f.seek(last_position)
            new_content = f.read()
            new_position = f.tell()

            # Limit to last max_lines to prevent exceeding maximum call size
            if new_content:
                lines = new_content.splitlines(keepends=True)
                if len(lines) > max_lines:
                    # Keep only the last max_lines
                    new_content = "".join(lines[-max_lines:])
                    # Update position to reflect we're only keeping tail
                    # This ensures we don't skip content on next read
                    # but we'll handle truncation at display level
                    new_position = f.tell()

            return new_content, new_position
    except Exception as e:
        return f"Error reading log file: {str(e)}", last_position


def run_crawl_async(company: Company) -> ProcessingStats | None:
    """Run crawling using LegalDocumentPipeline in a completely isolated thread with its own event loop"""

    def run_in_thread() -> ProcessingStats | None:
        # Suppress Streamlit ScriptRunContext warnings in worker threads
        with suppress_streamlit_warnings():
            # Create a completely fresh event loop in this thread
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                # Create pipeline instance for single company processing
                pipeline = LegalDocumentPipeline(
                    max_depth=4,
                    max_pages=500,
                    crawler_strategy="bfs",
                    concurrent_limit=5,  # Reduced for single company
                    delay_between_requests=1.0,
                )

                # Process single company and return documents
                result = loop.run_until_complete(pipeline.run([company]))

                # CRITICAL: Wait until ALL tasks are truly complete before closing the loop
                # This includes all database operations that may be pending
                max_wait_seconds = 2  # Reduced from 10
                wait_interval = 0.1
                max_iterations = int(max_wait_seconds / wait_interval)

                for _ in range(max_iterations):
                    # Get all pending tasks (excluding the current gather task if any)
                    all_tasks = asyncio.all_tasks(loop)
                    pending_tasks = [
                        t for t in all_tasks if not t.done() and t is not asyncio.current_task(loop)
                    ]

                    if not pending_tasks:
                        break

                    # Wait for pending tasks to complete
                    try:
                        loop.run_until_complete(asyncio.wait(pending_tasks, timeout=wait_interval))
                    except Exception:
                        pass

                # Final verification: ensure no tasks remain
                final_tasks = [
                    t
                    for t in asyncio.all_tasks(loop)
                    if not t.done() and t is not asyncio.current_task(loop)
                ]
                if final_tasks:
                    # Force wait for any remaining tasks with a small timeout
                    loop.run_until_complete(asyncio.wait(final_tasks, timeout=1.0))

                return result
            finally:
                # Only close the loop after we've verified all tasks are complete
                # Shutdown async generators first
                try:
                    loop.run_until_complete(loop.shutdown_asyncgens())
                except Exception:
                    pass

                # Close the loop - all operations should be complete by now
                loop.close()

    # Run in a separate thread to avoid any event loop conflicts
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future = executor.submit(run_in_thread)
        try:
            return future.result()
        except concurrent.futures.TimeoutError:
            st.error("Crawling operation timed out")
            return None
        except Exception as e:
            st.error(f"Crawling error: {str(e)}")
            return None


def run_crawl_all_companies_async(
    companies: list[Company], max_parallel: int = 2
) -> dict[str, ProcessingStats | None]:
    """Run crawling for all companies with optional parallelization

    Args:
        companies: List of companies to crawl
        max_parallel: Maximum number of companies to crawl in parallel (default: 2)

    Returns:
        Dictionary mapping company slugs to their processing stats (or None if failed)
    """
    results: dict[str, ProcessingStats | None] = {}

    def run_in_thread() -> dict[str, ProcessingStats | None]:
        with suppress_streamlit_warnings():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                # Use semaphore to limit parallel execution
                semaphore = asyncio.Semaphore(max_parallel)

                async def crawl_with_semaphore(
                    company: Company,
                ) -> tuple[str, ProcessingStats | None]:
                    async with semaphore:
                        try:
                            pipeline = LegalDocumentPipeline(
                                max_depth=4,
                                max_pages=500,
                                crawler_strategy="bfs",
                                concurrent_limit=5,
                                delay_between_requests=1.0,
                            )
                            # Process single company - returns list[Document]
                            documents = await pipeline._process_company(company)
                            # Create a minimal ProcessingStats for single company
                            return company.slug, ProcessingStats(
                                companies_processed=1,
                                companies_failed=0,
                                failed_company_slugs=[],
                                legal_documents_stored=len(documents) if documents else 0,
                            )
                        except Exception as e:
                            # Log error but don't use st.error in thread context
                            from src.core.logging import get_logger

                            logger = get_logger(__name__)
                            logger.error(f"Error crawling {company.name}: {str(e)}")
                            return company.slug, None

                # Create tasks for all companies
                tasks = [crawl_with_semaphore(company) for company in companies]
                # Run all tasks
                crawl_results = loop.run_until_complete(asyncio.gather(*tasks))

                # Convert results to dictionary
                for slug, stats in crawl_results:
                    results[slug] = stats

                return results
            finally:
                # CRITICAL: Wait until ALL tasks are truly complete before closing the loop
                # This includes all database operations that may be pending
                max_wait_seconds = 2  # Reduced from 10
                wait_interval = 0.1
                max_iterations = int(max_wait_seconds / wait_interval)

                for _ in range(max_iterations):
                    # Get all pending tasks
                    all_tasks = asyncio.all_tasks(loop)
                    pending_tasks = [
                        t for t in all_tasks if not t.done() and t is not asyncio.current_task(loop)
                    ]

                    if not pending_tasks:
                        break

                    # Wait for pending tasks to complete
                    try:
                        loop.run_until_complete(asyncio.wait(pending_tasks, timeout=wait_interval))
                    except Exception:
                        pass

                # Final verification: ensure no tasks remain
                final_tasks = [
                    t
                    for t in asyncio.all_tasks(loop)
                    if not t.done() and t is not asyncio.current_task(loop)
                ]
                if final_tasks:
                    # Force wait for any remaining tasks with a small timeout
                    loop.run_until_complete(asyncio.wait(final_tasks, timeout=1.0))

                # Only close the loop after we've verified all tasks are complete
                # Shutdown async generators first
                try:
                    loop.run_until_complete(loop.shutdown_asyncgens())
                except Exception:
                    pass

                # Close the loop - all operations should be complete by now
                loop.close()

    # Run in a separate thread
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future = executor.submit(run_in_thread)
        try:
            return future.result()
        except Exception as e:
            st.error(f"Crawling operation failed: {str(e)}")
            return {}


def show_crawling() -> None:
    st.title("🕷️ Start Crawling")

    # Get all companies
    companies = run_async(get_all_companies_isolated())

    if companies is None:
        st.error("Failed to load companies from database")
        return

    if not companies:
        st.warning("No companies found. Please create a company first.")
        return

    # Filter companies that have crawl_base_urls
    companies_with_urls = [c for c in companies if c.crawl_base_urls]

    if not companies_with_urls:
        st.warning(
            "No companies have crawl base URLs configured. Please add crawl URLs to at least one company."
        )
        return

    # Create company dropdown options
    company_options = {
        f"{company.name} ({company.slug})": company for company in companies_with_urls
    }

    # Check if a company was preselected (from session state)
    preselected_company = st.session_state.get("selected_company_for_crawl", None)
    default_index = 0

    if preselected_company:
        # Find the index of the preselected company
        for i, company in enumerate(companies_with_urls):
            if company.id == preselected_company:
                default_index = i
                break

    selected_company_key = st.selectbox(
        "Select Company to Crawl",
        options=list(company_options.keys()),
        index=default_index,
        help="Choose which company you want to crawl for legal documents",
    )

    selected_company = company_options[selected_company_key]

    # Show company details
    st.write("---")
    st.subheader(f"Company Details: {selected_company.name}")

    col1, col2 = st.columns(2)

    with col1:
        st.write("**Domains:**")
        for domain in selected_company.domains:
            st.write(f"• {domain}")

    with col2:
        st.write("**Crawl Base URLs:**")
        for url in selected_company.crawl_base_urls:
            st.write(f"• [{url}]({url})")

    st.write("**Categories:**")
    st.write(
        ", ".join(selected_company.categories) if selected_company.categories else "No categories"
    )

    # Crawling section
    st.write("---")
    st.subheader("Start Crawling")

    # Single company crawling section
    st.info(f"""
    **Single Company:**
    • Crawl the base URLs for {selected_company.name}
    • Find and classify legal documents
    • Store discovered documents in the database
    • This process may take several minutes
    """)

    # Initialize crawl session state
    crawl_key = f"crawl_{selected_company.slug}"
    if crawl_key not in st.session_state:
        st.session_state[crawl_key] = {
            "running": False,
            "future": None,
            "executor": None,
            "log_path": None,
            "log_position": 0,
            "log_content": "",
            "stats": None,
        }

    crawl_state = st.session_state[crawl_key]

    # Start crawling button for single company
    if st.button("🚀 Start Crawling", type="primary", key="start_crawl_btn"):
        # Clear any previous crawl session state
        if "selected_company_for_crawl" in st.session_state:
            del st.session_state["selected_company_for_crawl"]

        # Determine log file path before starting (using same format as crawler)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        log_filename = f"{timestamp}_{selected_company.slug}_crawl.log"
        expected_log_path = Path("logs") / log_filename

        # Initialize crawl state
        crawl_state["running"] = True
        crawl_state["log_path"] = str(expected_log_path)
        crawl_state["log_position"] = 0
        crawl_state["log_content"] = ""
        crawl_state["stats"] = None

        # Start crawling in a thread (don't use context manager to keep executor alive)
        executor = concurrent.futures.ThreadPoolExecutor()
        future = executor.submit(run_crawl_async, selected_company)
        crawl_state["future"] = future
        crawl_state["executor"] = executor  # Keep executor reference

    # Display crawl status and logs if crawl is running or was started
    if crawl_state.get("running") or crawl_state.get("future"):
        # Check if crawl is still running
        if crawl_state.get("future") and not crawl_state["future"].done():
            # Poll for logs
            log_path = Path(crawl_state["log_path"]) if crawl_state.get("log_path") else None
            if log_path and log_path.exists():
                new_content, new_position = read_log_file_tail(
                    log_path, crawl_state["log_position"], max_lines=1000
                )
                if new_content:
                    # Accumulate new content
                    crawl_state["log_content"] += new_content
                    # Keep only last 1000 lines to prevent exceeding maximum call size
                    all_lines = crawl_state["log_content"].splitlines(keepends=True)
                    if len(all_lines) > 1000:
                        crawl_state["log_content"] = "".join(all_lines[-1000:])
                    crawl_state["log_position"] = new_position

            # Use status for better control over display
            with st.status(
                f"🕷️ Crawling {selected_company.name}... This may take several minutes.",
                expanded=True,
            ) as status:
                st.write("🔍 Crawler is running...")

                # Display logs
                if crawl_state["log_content"]:
                    st.write("---")
                    st.subheader("📋 Crawler Logs (Live)")
                    if log_path:
                        st.caption(f"Log file: `{log_path}`")
                    st.code(crawl_state["log_content"], language="text")
                else:
                    st.info("📝 Waiting for logs to appear...")

            # Rerun to update logs (with a small delay to avoid too frequent updates)
            time.sleep(0.5)
            st.rerun()

        else:
            # Crawl completed, get final result
            if crawl_state.get("future"):
                try:
                    crawl_state["stats"] = crawl_state["future"].result()
                except Exception as e:
                    crawl_state["stats"] = None
                    st.error(f"Crawling error: {str(e)}")
                finally:
                    # Clean up executor
                    if "executor" in crawl_state:
                        crawl_state["executor"].shutdown(wait=False)
                        del crawl_state["executor"]
                    crawl_state["running"] = False
                    crawl_state["future"] = None

            # Read final log content (limit to last 1000 lines)
            log_path = Path(crawl_state["log_path"]) if crawl_state.get("log_path") else None
            if log_path and log_path.exists():
                final_content = read_log_file(log_path)
                if final_content:
                    # Keep only last 1000 lines to prevent exceeding maximum call size
                    lines = final_content.splitlines(keepends=True)
                    if len(lines) > 1000:
                        crawl_state["log_content"] = "".join(lines[-1000:])
                    else:
                        crawl_state["log_content"] = final_content

            # Show final status
            with st.status(
                f"✅ Crawling {selected_company.name} completed!"
                if crawl_state["stats"] is not None
                else f"❌ Crawling {selected_company.name} failed",
                expanded=False,
                state="complete" if crawl_state["stats"] is not None else "error",
            ) as status:
                if crawl_state["log_content"]:
                    st.write("---")
                    st.subheader("📋 Crawler Logs")
                    if log_path:
                        st.caption(f"Log file: `{log_path}`")
                    with st.expander("View full crawler logs", expanded=True):
                        st.code(crawl_state["log_content"], language="text")

            # Show results
            if crawl_state["stats"] is not None:
                st.success("✅ Crawling completed successfully!")
                if crawl_state["stats"].legal_documents_stored > 0:
                    st.write(
                        f"**Found {crawl_state['stats'].legal_documents_stored} legal documents.**"
                    )
                else:
                    st.warning("No legal documents were found during the crawl.")
                    with st.expander("Possible reasons:"):
                        st.write("• The websites don't have legal documents")
                        st.write("• The documents aren't accessible")
                        st.write("• The classification didn't identify them as legal documents")
            else:
                st.error("Crawling failed. Please check the logs and try again.")

            # Clear crawl state after showing results
            if crawl_key in st.session_state:
                del st.session_state[crawl_key]

    # All companies crawling section
    st.write("---")
    st.subheader("Crawl All Companies")

    st.info(f"""
    **All Companies ({len(companies_with_urls)} companies):**
    • Crawl all companies with crawl URLs configured
    • Process up to 2 companies in parallel
    • This process may take a long time
    """)

    # Start crawling all companies button
    if st.button("🚀 Crawl All Companies", type="secondary", key="start_crawl_all_btn"):
        # Start crawling all companies
        with st.status(
            f"🕷️ Crawling {len(companies_with_urls)} companies... This may take a very long time.",
            expanded=True,
        ) as status:
            # Show progress info
            st.write(f"🔍 Starting crawler for {len(companies_with_urls)} companies...")

            # Run the crawling process for all companies
            results = run_crawl_all_companies_async(companies_with_urls, max_parallel=2)

            if results:
                successful = sum(1 for stats in results.values() if stats is not None)
                status.update(
                    label=f"✅ Crawling completed! {successful}/{len(results)} companies processed.",
                    state="complete",
                    expanded=False,
                )
            else:
                status.update(label="❌ Crawling all companies failed", state="error")

        if results:
            # Show results summary
            successful = sum(1 for stats in results.values() if stats is not None)
            failed = len(results) - successful
            total_docs = sum(
                stats.legal_documents_stored for stats in results.values() if stats is not None
            )

            if successful > 0:
                st.success(f"✅ Crawling completed! {successful} companies processed successfully.")
                st.write(f"**Total legal documents found: {total_docs}**")

                if failed > 0:
                    st.warning(f"⚠️ {failed} companies failed to crawl.")

                # Show detailed results
                with st.expander("View detailed results"):
                    for company in companies_with_urls:
                        stats = results.get(company.slug)
                        if stats is not None:
                            st.write(
                                f"✅ **{company.name}**: {stats.legal_documents_stored} documents"
                            )
                        else:
                            st.write(f"❌ **{company.name}**: Failed")
            else:
                st.error("All companies failed to crawl. Please check the logs and try again.")
        else:
            st.error("Crawling operation failed to return results.")

    # Back to companies button
    st.write("---")
    if st.button("← Back to Companies", key="back_to_companies"):
        # Clear crawl session state and navigate back
        if "selected_company_for_crawl" in st.session_state:
            del st.session_state["selected_company_for_crawl"]
        st.session_state["current_page"] = "view_companies"
        st.rerun()
