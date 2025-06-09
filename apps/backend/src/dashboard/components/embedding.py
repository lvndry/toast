import asyncio
import concurrent.futures

import streamlit as st

from src.dashboard.db_utils import get_all_companies_isolated
from src.dashboard.utils import run_async
from src.embedding import embed_company_documents


def run_embedding_async(company_slug: str):
    """Run embedding in a completely isolated thread with its own event loop"""

    def run_in_thread():
        # Create a completely fresh event loop in this thread
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(embed_company_documents(company_slug))
        finally:
            # Cancel all pending tasks before closing the loop
            pending_tasks = asyncio.all_tasks(loop)
            for task in pending_tasks:
                task.cancel()

            # Wait for all tasks to be cancelled
            if pending_tasks:
                loop.run_until_complete(
                    asyncio.gather(*pending_tasks, return_exceptions=True)
                )

            loop.close()

    # Run in a separate thread to avoid any event loop conflicts
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future = executor.submit(run_in_thread)
        try:
            return future.result(timeout=600)  # 10 minute timeout for embedding
        except concurrent.futures.TimeoutError:
            st.error("Embedding operation timed out (10 minutes)")
            return False
        except Exception as e:
            st.error(f"Embedding error: {str(e)}")
            return False


def show_embedding():
    st.title("🔍 Document Embedding")

    # Get all companies
    companies = run_async(get_all_companies_isolated())

    if companies is None:
        st.error("Failed to load companies from database")
        return

    if not companies:
        st.warning("No companies found. Please create a company first.")
        return

    # Create company dropdown options
    company_options = {
        f"{company.name} ({company.slug})": company for company in companies
    }

    # Check if a company was preselected (from session state)
    preselected_company = st.session_state.get("selected_company_for_embedding", None)
    default_index = 0

    if preselected_company:
        # Find the index of the preselected company
        for i, company in enumerate(companies):
            if company.id == preselected_company:
                default_index = i
                break

    selected_company_key = st.selectbox(
        "Select Company for Embedding",
        options=list(company_options.keys()),
        index=default_index,
        help="Choose which company's documents you want to embed for semantic search",
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

    # Embedding section
    st.write("---")
    st.subheader("Generate Document Embeddings")

    st.info(f"""
    **This will:**
    • Process all documents for {selected_company.name}
    • Split documents into chunks for better search
    • Generate vector embeddings using Mistral's embedding model
    • Store embeddings in Pinecone for semantic search
    • This process may take several minutes depending on document count
    """)

    # Start embedding button
    col1, col2, col3 = st.columns([2, 1, 2])

    with col2:
        if st.button("🚀 Start Embedding", type="primary", key="start_embedding_btn"):
            # Clear any previous embedding session state
            if "selected_company_for_embedding" in st.session_state:
                del st.session_state["selected_company_for_embedding"]

            # Start embedding
            with st.spinner(
                f"Processing documents for {selected_company.name}... This may take several minutes."
            ):
                # Show progress info
                progress_placeholder = st.empty()
                progress_placeholder.info("🔍 Loading documents...")

                # Run the embedding process
                success = run_embedding_async(selected_company.slug)

                progress_placeholder.empty()

                if success is not False:  # None or True means success
                    st.success("✅ Document embedding completed successfully!")
                    st.info(f"""
                    **What happened:**
                    • Documents were split into searchable chunks
                    • Vector embeddings were generated for each chunk
                    • Embeddings were stored in Pinecone index under namespace: `{selected_company.slug}`
                    • You can now perform semantic search on {selected_company.name}'s documents
                    """)
                else:
                    st.error("Embedding failed. Please check the logs and try again.")
                    st.info("**Common issues:**")
                    st.write("• No documents found for this company")
                    st.write("• API key issues (Mistral or Pinecone)")
                    st.write("• Network connectivity problems")

    # Back to companies button
    st.write("---")
    if st.button("← Back to Companies", key="back_to_companies_from_embedding"):
        # Clear embedding session state and navigate back
        if "selected_company_for_embedding" in st.session_state:
            del st.session_state["selected_company_for_embedding"]
        st.session_state["current_page"] = "View Companies"
        st.rerun()
