import asyncio
from collections.abc import AsyncGenerator

import streamlit as st

from src.dashboard.db_utils import get_all_companies_isolated, get_company_documents_isolated
from src.dashboard.utils import run_async
from src.summarizer import generate_company_meta_summary, summarize_all_company_documents


def run_summarization_async(
    company_slug: str, loop: asyncio.AbstractEventLoop | None = None
) -> bool:
    """Run document summarization in an isolated async context"""
    try:
        should_close_loop = False
        if loop is None:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            should_close_loop = True

        try:
            loop.run_until_complete(summarize_all_company_documents(company_slug))
            return True
        finally:
            if should_close_loop:
                # Clean up pending tasks
                pending_tasks = asyncio.all_tasks(loop)
                if pending_tasks:
                    # Cancel all tasks at once and wait for completion
                    for task in pending_tasks:
                        task.cancel()

                    # Wait for all cancelled tasks to finish
                    loop.run_until_complete(asyncio.gather(*pending_tasks, return_exceptions=True))

                loop.close()
    except Exception as e:
        st.error(f"Summarization error: {str(e)}")
        return False


async def generate_meta_summary_async(company_slug: str) -> AsyncGenerator[str, None]:
    """Generate meta summary for a company"""
    result = await generate_company_meta_summary(company_slug)
    summary_content = str(result)  # or format as needed
    yield summary_content


def show_summarization() -> None:
    st.title("📋 Document Summarization")

    # Get all companies
    companies = run_async(get_all_companies_isolated())

    if companies is None:
        st.error("Failed to load companies from database")
        return

    if not companies:
        st.warning("No companies found. Please create a company first.")
        return

    # Add Summarize All section
    st.write("---")
    st.subheader("🌐 Summarize All Companies")

    st.info("""
    **This will:**
    • Analyze documents for all companies
    • Generate privacy-focused summaries for each document
    • Extract key points and transparency scores
    • This process may take several minutes depending on the number of companies and documents
    """)

    if st.button("🚀 Summarize All Companies", type="primary", key="summarize_all_btn"):
        with st.spinner("Analyzing documents for all companies... This may take several minutes."):
            progress_placeholder = st.empty()
            progress_placeholder.info("🔍 Processing documents...")

            # Create a single loop for all companies
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                all_success = True
                for company in companies:
                    progress_placeholder.info(f"Processing {company.name}...")
                    success = run_summarization_async(company.slug, loop)
                    if not success:
                        all_success = False
                        st.error(f"Failed to process documents for {company.name}")
            finally:
                # Clean up the loop after all companies are processed
                pending_tasks = asyncio.all_tasks(loop)
                if pending_tasks:
                    for task in pending_tasks:
                        task.cancel()
                    loop.run_until_complete(asyncio.gather(*pending_tasks, return_exceptions=True))
                loop.close()

            progress_placeholder.empty()

            if all_success:
                st.success("✅ Document analysis completed successfully for all companies!")
                st.info("""
                **What happened:**
                • All documents were analyzed for privacy practices
                • Summaries were generated with transparency and data usage scores
                • Key points were extracted for each document
                • Analysis data was stored in the database
                • You can now generate meta-summaries for individual companies
                """)
                st.rerun()
            else:
                st.error(
                    "Document analysis failed for some companies. Please check the logs and try again."
                )

    # Create company dropdown options
    company_options = {f"{company.name} ({company.slug})": company for company in companies}

    # Check if a company was preselected (from session state)
    preselected_company = st.session_state.get("selected_company_for_summarization", None)
    default_index = 0

    if preselected_company:
        # Find the index of the preselected company
        for i, company in enumerate(companies):
            if company.id == preselected_company:
                default_index = i
                break

    selected_company_key = st.selectbox(
        "Select Company for Summarization",
        options=list(company_options.keys()),
        index=default_index,
        help="Choose which company's documents you want to summarize",
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
        st.write("**Categories:**")
        if selected_company.categories:
            for category in selected_company.categories:
                st.write(f"• {category}")
        else:
            st.write("• No categories")

    # Get documents for this company
    st.write("---")
    documents = run_async(get_company_documents_isolated(selected_company.slug))

    if not documents:
        st.warning(f"No documents found for {selected_company.name}. Please crawl documents first.")
        return

    # Show document summary
    st.subheader("📄 Available Documents")

    # Count documents by type
    doc_type_counts: dict[str, int] = {}
    analyzed_count = 0

    for doc in documents:
        doc_type = str(doc.doc_type)
        doc_type_counts[str(doc_type)] = doc_type_counts.get(str(doc_type), 0) + 1
        if hasattr(doc, "analysis") and doc.analysis:
            analyzed_count += 1

    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Total Documents", len(documents))
    with col2:
        st.metric("Already Analyzed", analyzed_count)
    with col3:
        st.metric("Pending Analysis", len(documents) - analyzed_count)

    # Show document types
    if doc_type_counts:
        st.write("**Document Types:**")
        for doc_type, count in doc_type_counts.items():
            st.write(f"• {doc_type.replace('_', ' ').title()}: {count}")

    # Document Analysis Section
    st.write("---")
    st.subheader("🔍 Individual Document Analysis")

    st.info(f"""
    **This will:**
    • Analyze each document for {selected_company.name}
    • Generate privacy-focused summaries for each document
    • Extract key points and transparency scores
    • Identify data usage patterns and user rights
    • This process may take several minutes depending on document count
    """)

    col1, col2, col3 = st.columns([2, 1, 2])

    with col2:
        if st.button("🚀 Summarize Documents", type="primary", key="summarize_documents_btn"):
            # Clear any previous session state
            if "selected_company_for_summarization" in st.session_state:
                del st.session_state["selected_company_for_summarization"]

            # Start document analysis
            with st.spinner(
                f"Analyzing documents for {selected_company.name}... This may take several minutes."
            ):
                progress_placeholder = st.empty()
                progress_placeholder.info("🔍 Processing documents...")

                # Run the summarization process
                success = run_summarization_async(selected_company.slug)

                progress_placeholder.empty()

                if success:
                    st.success("✅ Document analysis completed successfully!")
                    st.info("""
                    **What happened:**
                    • Each document was analyzed for privacy practices
                    • Summaries were generated with transparency and data usage scores
                    • Key points were extracted for each document
                    • Analysis data was stored in the database
                    • You can now generate a meta-summary of all documents
                    """)
                    # Refresh the page to show updated analysis count
                    st.rerun()
                else:
                    st.error("Document analysis failed. Please check the logs and try again.")

    # Meta Summary Section
    st.write("---")
    st.subheader("📊 Meta Summary")

    if analyzed_count == 0:
        st.warning("No analyzed documents found. Please run document analysis first.")
    else:
        st.info(f"""
        **Meta Summary will:**
        • Synthesize insights from all {analyzed_count} analyzed documents
        • Identify patterns and contradictions across documents
        • Provide an overall privacy assessment for {selected_company.name}
        • Highlight the most important privacy considerations for users
        """)

        if st.button("📋 Generate Meta Summary", type="primary", key="generate_meta_summary_btn"):
            with st.spinner(f"Generating comprehensive summary for {selected_company.name}..."):
                try:
                    # Create a placeholder for streaming content
                    summary_placeholder = st.empty()

                    # Generate the meta summary using async generator
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)

                    try:

                        async def get_summary() -> str:
                            result = await generate_company_meta_summary(selected_company.slug)
                            return str(result)

                        summary_content = loop.run_until_complete(get_summary())
                        summary_placeholder.markdown(summary_content)
                    finally:
                        loop.close()

                    st.success("✅ Meta summary generated successfully!")

                except Exception as e:
                    st.error(f"Failed to generate meta summary: {str(e)}")

    # Back to companies button
    st.write("---")
    if st.button("← Back to Companies", key="back_to_companies_from_summarization"):
        # Clear summarization session state and navigate back
        if "selected_company_for_summarization" in st.session_state:
            del st.session_state["selected_company_for_summarization"]
        st.session_state["current_page"] = "View Companies"
        st.rerun()
