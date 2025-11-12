import streamlit as st

from src.dashboard.dashboard_embedding import embed_companies, embed_company
from src.dashboard.db_utils import get_all_companies_isolated
from src.dashboard.utils import run_async


def show_embedding() -> None:
    st.title("🔍 Generate & Store Embeddings")

    # Get all companies
    companies = run_async(get_all_companies_isolated())

    if companies is None:
        st.error("Failed to load companies from database")
        return

    if not companies:
        st.warning("No companies found. Please create a company first.")
        return

    # Create company dropdown options
    company_options = {f"{company.name} ({company.slug})": company for company in companies}

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

    # Start embedding buttons
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
                success = embed_company(selected_company.slug)

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
                    st.write("• API key issues (LLM or Pinecone)")
                    st.write("• Network connectivity problems")

    # Add Embed All button
    with col2:
        if st.button("🚀 Embed All Companies", type="secondary", key="embed_all_btn"):
            # Start embedding for all companies
            with st.spinner(
                "Processing documents for all companies... This may take several minutes."
            ):
                # Show progress info
                progress_placeholder = st.empty()
                progress_placeholder.info("🔍 Loading documents for all companies...")

                # Get all company slugs
                company_slugs = [company.slug for company in companies]

                # Run the embedding process for all companies
                results = embed_companies(company_slugs, max_concurrency=3)

                progress_placeholder.empty()

                if results:
                    success_count = sum(1 for _, success in results if success is not False)
                    st.success(
                        f"✅ Document embedding completed for {success_count} out of {len(companies)} companies!"
                    )

                    # Show detailed results
                    st.info("**Embedding Results:**")
                    for slug, success in results:
                        company_name = next((c.name for c in companies if c.slug == slug), slug)
                        if success is not False:
                            st.write(f"✅ {company_name}: Success")
                        else:
                            st.write(f"❌ {company_name}: Failed")

                    # Show summary
                    if success_count == len(companies):
                        st.success("🎉 All companies processed successfully!")
                    elif success_count > 0:
                        st.warning(
                            f"⚠️ {len(companies) - success_count} companies failed to process. Check the results above for details."
                        )
                    else:
                        st.error(
                            "❌ All companies failed to process. Please check the logs and try again."
                        )
                else:
                    st.error(
                        "Embedding failed for all companies. Please check the logs and try again."
                    )
                    st.info("**Common issues:**")
                    st.write("• No documents found for companies")
                    st.write("• API key issues (LLM or Pinecone)")
                    st.write("• Network connectivity problems")

    # Back to companies button
    st.write("---")
    if st.button("← Back to Companies", key="back_to_companies_from_embedding"):
        # Clear embedding session state and navigate back
        if "selected_company_for_embedding" in st.session_state:
            del st.session_state["selected_company_for_embedding"]
        st.session_state["current_page"] = "view_companies"
        st.rerun()
