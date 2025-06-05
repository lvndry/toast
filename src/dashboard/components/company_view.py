import streamlit as st

from src.company import Company
from src.dashboard.db_utils import (
    delete_company_isolated,
    get_all_companies_isolated,
    update_company_isolated,
)
from src.dashboard.utils import run_async


def show_edit_form(company: Company):
    """Show edit form for a company"""
    st.subheader(f"Edit Company: {company.name}")

    with st.form(f"edit_company_form_{company.id}"):
        # Pre-fill form with existing data
        name = st.text_input("Company Name", value=company.name)
        slug = st.text_input("Company Slug", value=company.slug)

        # Convert lists to text for the text areas
        domains_text = "\n".join(company.domains) if company.domains else ""
        categories_text = "\n".join(company.categories) if company.categories else ""
        crawl_urls_text = (
            "\n".join(company.crawl_base_urls) if company.crawl_base_urls else ""
        )

        domains = st.text_area("Domains (one per line)", value=domains_text)
        categories = st.text_area("Categories (one per line)", value=categories_text)
        crawl_base_urls = st.text_area(
            "Crawl Base URLs (one per line)", value=crawl_urls_text
        )

        col1, col2 = st.columns(2)
        with col1:
            submitted = st.form_submit_button("Update Company", type="primary")
        with col2:
            cancelled = st.form_submit_button("Cancel")

        if cancelled:
            # Clear the edit state
            if f"editing_company_{company.id}" in st.session_state:
                del st.session_state[f"editing_company_{company.id}"]
            st.rerun()

        if submitted:
            try:
                # Parse the form data
                domains_list = [
                    domain.strip() for domain in domains.split("\n") if domain.strip()
                ]
                categories_list = [
                    category.strip()
                    for category in categories.split("\n")
                    if category.strip()
                ]
                crawl_base_urls_list = (
                    [url.strip() for url in crawl_base_urls.split("\n") if url.strip()]
                    if crawl_base_urls.strip()
                    else None
                )

                # Create updated company instance
                updated_company = Company(
                    id=company.id,  # Keep the same ID
                    name=name,
                    slug=slug,
                    domains=domains_list,
                    categories=categories_list,
                    crawl_base_urls=crawl_base_urls_list,
                )

                # Update in database
                success = run_async(update_company_isolated(updated_company))

                if success:
                    st.success(f"Company '{name}' updated successfully!")
                    # Clear the edit state
                    if f"editing_company_{company.id}" in st.session_state:
                        del st.session_state[f"editing_company_{company.id}"]
                    st.rerun()
                else:
                    st.error("Failed to update company")

            except Exception as e:
                st.error(f"Error updating company: {str(e)}")


def show_delete_confirmation(company: Company):
    """Show delete confirmation dialog"""
    st.error(f"⚠️ **Delete Company: {company.name}**")
    st.write("**This action cannot be undone!**")
    st.write(
        "All data associated with this company will be permanently deleted, including:"
    )
    st.write("• Company information")
    st.write("• Associated documents")
    st.write("• Crawl data")

    st.write("---")

    col1, col2, col3 = st.columns([1, 1, 2])

    with col1:
        if st.button(
            "🗑️ **DELETE**", key=f"confirm_delete_{company.id}", type="primary"
        ):
            # Perform the deletion
            success = run_async(delete_company_isolated(company.id))

            if success:
                st.success(f"Company '{company.name}' has been deleted successfully!")
                # Clear all related session state
                delete_confirm_key = f"delete_confirm_{company.id}"
                if delete_confirm_key in st.session_state:
                    del st.session_state[delete_confirm_key]
                st.rerun()
            else:
                st.error("Failed to delete company")

    with col2:
        if st.button("Cancel", key=f"cancel_delete_{company.id}"):
            # Clear the delete confirmation state
            delete_confirm_key = f"delete_confirm_{company.id}"
            if delete_confirm_key in st.session_state:
                del st.session_state[delete_confirm_key]
            st.rerun()


def show_company_view():
    st.title("All Companies")

    try:
        st.write("Loading companies...")
        companies = run_async(get_all_companies_isolated())

        if companies is None:
            st.error("Failed to load companies from database")
            return

        if not companies:
            st.info("No companies found. Create your first company!")
            return

        st.write(f"Total companies: {len(companies)}")

        # Create search/filter functionality
        search_term = st.text_input(
            "Search companies", placeholder="Enter company name or slug..."
        )

        # Filter companies based on search term
        if search_term:
            filtered_companies = [
                company
                for company in companies
                if search_term.lower() in company.name.lower()
                or search_term.lower() in company.slug.lower()
                or any(
                    search_term.lower() in domain.lower() for domain in company.domains
                )
                or any(
                    search_term.lower() in category.lower()
                    for category in company.categories
                )
            ]
        else:
            filtered_companies = companies

        if not filtered_companies:
            st.warning(f"No companies found matching '{search_term}'")
            return

        # Display companies in a grid/card layout
        for i, company in enumerate(filtered_companies):
            # Check if this company is being edited or deleted
            edit_key = f"editing_company_{company.id}"
            delete_confirm_key = f"delete_confirm_{company.id}"
            is_editing = st.session_state.get(edit_key, False)
            is_confirming_delete = st.session_state.get(delete_confirm_key, False)

            if is_confirming_delete:
                # Show delete confirmation dialog
                show_delete_confirmation(company)
            elif is_editing:
                # Show edit form instead of company card
                show_edit_form(company)
            else:
                # Show normal company card
                with st.expander(f"🏢 {company.name} ({company.slug})", expanded=False):
                    col1, col2 = st.columns(2)

                    with col1:
                        st.write("**Company Details:**")
                        st.write(f"• **ID:** `{company.id}`")
                        st.write(f"• **Name:** {company.name}")
                        st.write(f"• **Slug:** {company.slug}")

                        st.write("**Domains:**")
                        for domain in company.domains:
                            st.write(f"• {domain}")

                    with col2:
                        st.write("**Categories:**")
                        for category in company.categories:
                            st.write(f"• {category}")

                        if company.crawl_base_urls:
                            st.write("**Crawl Base URLs:**")
                            for url in company.crawl_base_urls:
                                st.write(f"• [{url}]({url})")
                        else:
                            st.write("**Crawl Base URLs:** None configured")

                    # Action buttons
                    st.write("---")
                    col3, col4, col5, col6 = st.columns(4)
                    with col3:
                        if st.button("📊 Analytics", key=f"analytics_{company.id}"):
                            st.info("Analytics feature coming soon!")
                    with col4:
                        if st.button("📄 Documents", key=f"docs_{company.id}"):
                            st.info("Documents view coming soon!")
                    with col5:
                        if st.button("✏️ Edit", key=f"edit_{company.id}"):
                            # Set the editing state
                            st.session_state[edit_key] = True
                            st.rerun()
                    with col6:
                        if st.button("🗑️ Delete", key=f"delete_{company.id}"):
                            # Set the delete confirmation state
                            st.session_state[delete_confirm_key] = True
                            st.rerun()

        # Summary statistics
        st.write("---")
        st.subheader("Summary Statistics")

        col1, col2, col3, col4 = st.columns(4)

        with col1:
            st.metric("Total Companies", len(companies))

        with col2:
            total_domains = sum(len(company.domains) for company in companies)
            st.metric("Total Domains", total_domains)

        with col3:
            companies_with_crawl_urls = len([c for c in companies if c.crawl_base_urls])
            st.metric("Companies with Crawl URLs", companies_with_crawl_urls)

        with col4:
            unique_categories = set()
            for company in companies:
                unique_categories.update(company.categories)
            st.metric("Unique Categories", len(unique_categories))

        # Categories breakdown
        if unique_categories:
            st.write("**All Categories:**")
            categories_list = sorted(list(unique_categories))
            st.write(", ".join(categories_list))

        # Companies without crawl URLs
        companies_without_crawl_urls = [c for c in companies if not c.crawl_base_urls]

        if companies_without_crawl_urls:
            st.write("---")
            st.write("**⚠️ Companies without Crawl Base URLs:**")
            company_names = [company.name for company in companies_without_crawl_urls]
            st.write(", ".join(company_names))

            if len(companies_without_crawl_urls) == 1:
                st.info("1 company needs crawl URLs configured.")
            else:
                st.info(
                    f"{len(companies_without_crawl_urls)} companies need crawl URLs configured."
                )
    except Exception as e:
        st.error(f"Error loading companies: {str(e)}")
        st.write("Please try refreshing the page or check your database connection.")
