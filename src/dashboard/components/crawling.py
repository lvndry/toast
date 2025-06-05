import asyncio
import concurrent.futures

import streamlit as st

from src.company import Company
from src.crawl4ai_crawler import process_company
from src.dashboard.db_utils import get_all_companies_isolated
from src.dashboard.utils import run_async


def run_crawl_async(company: Company):
    """Run crawling in a completely isolated thread with its own event loop"""

    def run_in_thread():
        # Create a completely fresh event loop in this thread
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(process_company(company))
        finally:
            loop.close()

    # Run in a separate thread to avoid any event loop conflicts
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future = executor.submit(run_in_thread)
        try:
            return future.result(timeout=300)  # 5 minute timeout for crawling
        except concurrent.futures.TimeoutError:
            st.error("Crawling operation timed out (5 minutes)")
            return None
        except Exception as e:
            st.error(f"Crawling error: {str(e)}")
            return None


def show_crawling():
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
        ", ".join(selected_company.categories)
        if selected_company.categories
        else "No categories"
    )

    # Crawling section
    st.write("---")
    st.subheader("Start Crawling")

    st.info(f"""
    **This will:**
    • Crawl the base URLs for {selected_company.name}
    • Find and classify legal documents
    • Store discovered documents in the database
    • This process may take several minutes
    """)

    # Start crawling button
    col1, col2, col3 = st.columns([2, 1, 2])

    with col2:
        if st.button("🚀 Start Crawling", type="primary", key="start_crawl_btn"):
            # Clear any previous crawl session state
            if "selected_company_for_crawl" in st.session_state:
                del st.session_state["selected_company_for_crawl"]

            # Start crawling
            with st.spinner(
                f"Crawling {selected_company.name}... This may take several minutes."
            ):
                # Show progress info
                progress_placeholder = st.empty()
                progress_placeholder.info("🔍 Starting crawler...")

                # Run the crawling process
                documents = run_crawl_async(selected_company)

                if documents is not None:
                    progress_placeholder.empty()

                    # Show results
                    st.success("✅ Crawling completed successfully!")

                    if documents:
                        st.write(f"**Found {len(documents)} legal documents:**")

                        # Show document details in an expander
                        with st.expander("View discovered documents", expanded=True):
                            for i, doc in enumerate(documents, 1):
                                st.write(f"**{i}. {doc.url}**")
                                st.write(f"• Type: {doc.doc_type}")
                                st.write(
                                    f"• Legal document: {'Yes' if doc.is_legal_document else 'No'}"
                                )
                                st.write("---")
                    else:
                        st.warning("No legal documents were found during the crawl.")
                        st.info("This could mean:")
                        st.write("• The websites don't have legal documents")
                        st.write("• The documents aren't accessible")
                        st.write(
                            "• The classification didn't identify them as legal documents"
                        )
                else:
                    progress_placeholder.empty()
                    st.error("Crawling failed. Please check the logs and try again.")

    # Back to companies button
    st.write("---")
    if st.button("← Back to Companies", key="back_to_companies"):
        # Clear crawl session state and navigate back
        if "selected_company_for_crawl" in st.session_state:
            del st.session_state["selected_company_for_crawl"]
        st.session_state["current_page"] = "View Companies"
        st.rerun()
