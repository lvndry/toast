import asyncio
import concurrent.futures

import streamlit as st

from src.crawling import LegalDocumentPipeline, ProcessingStats
from src.dashboard.db_utils import get_all_companies_isolated
from src.dashboard.utils import run_async, suppress_streamlit_warnings
from src.models.company import Company


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

    # Start crawling button for single company
    if st.button("🚀 Start Crawling", type="primary", key="start_crawl_btn"):
        # Clear any previous crawl session state
        if "selected_company_for_crawl" in st.session_state:
            del st.session_state["selected_company_for_crawl"]

        # Use status for better control over display
        with st.status(
            f"🕷️ Crawling {selected_company.name}... This may take several minutes.",
            expanded=True,
        ) as status:
            # Show progress info
            st.write("🔍 Starting crawler...")

            # Run the crawling process
            processing_stats = run_crawl_async(selected_company)

            if processing_stats is not None:
                status.update(
                    label=f"✅ Crawling {selected_company.name} completed!",
                    state="complete",
                    expanded=False,
                )
                # Show results summary within status if desired, or outside
                if processing_stats.legal_documents_stored > 0:
                    st.write(f"Found {processing_stats.legal_documents_stored} legal documents.")
                else:
                    st.write("No legal documents were found.")
            else:
                status.update(
                    label=f"❌ Crawling {selected_company.name} failed",
                    state="error",
                    expanded=True,
                )

        if processing_stats is not None:
            # Show detailed success results outside status
            st.success("✅ Crawling completed successfully!")

            if processing_stats.legal_documents_stored > 0:
                st.write(f"**Found {processing_stats.legal_documents_stored} legal documents:**")
                # Removed redundant check if processing_stats is truthy as it's a BaseModel
            else:
                st.warning("No legal documents were found during the crawl.")
                with st.expander("Possible reasons:"):
                    st.write("• The websites don't have legal documents")
                    st.write("• The documents aren't accessible")
                    st.write("• The classification didn't identify them as legal documents")
        else:
            st.error("Crawling failed. Please check the logs and try again.")

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
