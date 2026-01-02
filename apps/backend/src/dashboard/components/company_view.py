import streamlit as st
from streamlit_tags import st_tags

from src.dashboard.db_utils import (
    delete_company_isolated,
    get_all_companies_isolated,
    update_company_isolated,
)
from src.dashboard.utils import run_async_with_retry
from src.models.company import Company
from src.models.user import UserTier


def show_edit_form(company: Company) -> None:
    """Show edit form for a company"""
    st.subheader(f"Edit Company: {company.name}")

    with st.form(f"edit_company_form_{company.id}"):
        # Pre-fill form with existing data
        name = st.text_input("Company Name", value=company.name)
        slug = st.text_input("Company Slug", value=company.slug)

        # Use tag inputs instead of text areas
        domains = st_tags(
            label="Domains",
            text="Press enter to add a domain",
            value=company.domains if company.domains else [],
            key=f"domains_{company.id}",
        )
        categories = st_tags(
            label="Categories",
            text="Press enter to add a category",
            value=company.categories if company.categories else [],
            key=f"categories_{company.id}",
        )
        crawl_base_urls = st_tags(
            label="Crawl Base URLs",
            text="Press enter to add a URL",
            value=company.crawl_base_urls if company.crawl_base_urls else [],
            key=f"crawl_urls_{company.id}",
        )

        # Tier visibility section
        st.write("**Tier Visibility:**")
        st.write("Select which user tiers can access this company:")

        # Get current tier visibility
        current_tiers = (
            company.visible_to_tiers
            if hasattr(company, "visible_to_tiers")
            else [UserTier.FREE, UserTier.BUSINESS, UserTier.ENTERPRISE]
        )

        free_tier = st.checkbox(
            "Free Tier", value=UserTier.FREE in current_tiers, key=f"free_tier_{company.id}"
        )
        business_tier = st.checkbox(
            "Business Tier",
            value=UserTier.BUSINESS in current_tiers,
            key=f"business_tier_{company.id}",
        )
        enterprise_tier = st.checkbox(
            "Enterprise Tier",
            value=UserTier.ENTERPRISE in current_tiers,
            key=f"enterprise_tier_{company.id}",
        )

        # Validate that at least one tier is selected
        if not any([free_tier, business_tier, enterprise_tier]):
            st.error("At least one tier must be selected!")
            return

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
                # Tags already return lists, just need to filter empty strings
                domains_list = [domain.strip() for domain in domains if domain.strip()]
                categories_list = [category.strip() for category in categories if category.strip()]
                crawl_base_urls_list = (
                    [url.strip() for url in crawl_base_urls if url.strip()]
                    if crawl_base_urls
                    else None
                )

                # Build tier visibility list
                visible_tiers = []
                if free_tier:
                    visible_tiers.append(UserTier.FREE)
                if business_tier:
                    visible_tiers.append(UserTier.BUSINESS)
                if enterprise_tier:
                    visible_tiers.append(UserTier.ENTERPRISE)

                # Create updated company instance
                updated_company = Company(
                    id=company.id,  # Keep the same ID
                    name=name,
                    slug=slug,
                    domains=domains_list,
                    categories=categories_list,
                    crawl_base_urls=crawl_base_urls_list if crawl_base_urls_list else [],
                    visible_to_tiers=visible_tiers,
                )

                # Update in database with retry
                success = run_async_with_retry(update_company_isolated(updated_company))

                if success:
                    st.success(f"Company '{name}' updated successfully!")
                    # Clear the edit state
                    if f"editing_company_{company.id}" in st.session_state:
                        del st.session_state[f"editing_company_{company.id}"]
                    st.rerun()
                else:
                    st.error("Failed to update company. Please try again.")

            except Exception as e:
                st.error(f"Error updating company: {str(e)}")


def show_delete_confirmation(company: Company) -> None:
    """Show delete confirmation dialog"""
    st.error(f"⚠️ **Delete Company: {company.name}**")
    st.write("**This action cannot be undone!**")
    st.write("All data associated with this company will be permanently deleted, including:")
    st.write("• Company information")
    st.write("• Associated documents")
    st.write("• Crawl data")

    st.write("---")

    col1, col2, col3 = st.columns([1, 1, 2])

    with col1:
        if st.button("🗑️ **DELETE**", key=f"confirm_delete_{company.id}", type="primary"):
            # Perform the deletion with retry
            success = run_async_with_retry(delete_company_isolated(company.id))

            if success:
                st.success(f"Company '{company.name}' has been deleted successfully!")
                # Clear all related session state
                delete_confirm_key = f"delete_confirm_{company.id}"
                if delete_confirm_key in st.session_state:
                    del st.session_state[delete_confirm_key]
                st.rerun()
            else:
                st.error("Failed to delete company. Please try again.")

    with col2:
        if st.button("Cancel", key=f"cancel_delete_{company.id}"):
            # Clear the delete confirmation state
            delete_confirm_key = f"delete_confirm_{company.id}"
            if delete_confirm_key in st.session_state:
                del st.session_state[delete_confirm_key]
            st.rerun()


def show_company_view() -> None:
    st.title("All Companies")

    # Add a refresh button
    col1, col2 = st.columns([1, 4])
    with col1:
        if st.button("🔄 Refresh", type="secondary"):
            st.rerun()

    try:
        with st.spinner("Loading companies..."):
            companies = run_async_with_retry(get_all_companies_isolated())

        if companies is None:
            st.error(
                "Failed to load companies from database. Please check your connection and try again."
            )
            st.info("💡 **Troubleshooting tips:**")
            st.write("• Make sure your MongoDB connection is working")
            st.write("• Check that the MONGO_URI environment variable is set correctly")
            st.write("• Try refreshing the page")
            return

        if not companies:
            st.info("No companies found. Create your first company!")
            return

        st.success(f"✅ Loaded {len(companies)} companies successfully")

        # Create search/filter functionality
        search_term = st.text_input("Search companies", placeholder="Enter company name or slug...")

        # Filter companies based on search term
        if search_term:
            filtered_companies = [
                company
                for company in companies
                if search_term.lower() in company.name.lower()
                or search_term.lower() in company.slug.lower()
                or any(search_term.lower() in domain.lower() for domain in company.domains)
                or any(search_term.lower() in category.lower() for category in company.categories)
            ]
        else:
            filtered_companies = companies

        # Sort filtered companies by name (case-insensitive)
        filtered_companies = sorted(filtered_companies, key=lambda x: x.name.lower())

        if not filtered_companies:
            st.warning(f"No companies found matching '{search_term}'")
            return

        # Display companies in a grid/card layout
        for _i, company in enumerate(filtered_companies):
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

                    # Tier visibility section
                    st.write("**Tier Visibility:**")
                    if hasattr(company, "visible_to_tiers") and company.visible_to_tiers:
                        tier_labels = []
                        for tier in company.visible_to_tiers:
                            if tier == UserTier.FREE:
                                tier_labels.append("🟢 Free")
                            elif tier == UserTier.BUSINESS:
                                tier_labels.append("🔵 Business")
                            elif tier == UserTier.ENTERPRISE:
                                tier_labels.append("🟣 Enterprise")

                        if len(tier_labels) == 3:
                            st.success("✅ Accessible to all tiers")
                        elif len(tier_labels) == 1:
                            st.warning(f"⚠️ Premium content: {tier_labels[0]}")
                        else:
                            st.info(f"📊 Limited access: {', '.join(tier_labels)}")
                    else:
                        st.info("📊 Accessible to all tiers (default)")

                    # Action buttons
                    st.write("---")
                    col3, col4, col5, col6, col7 = st.columns(5)
                    with col3:
                        if st.button("📊 Analytics", key=f"analytics_{company.id}"):
                            st.info("Analytics feature coming soon!")
                    with col4:
                        if st.button("📄 Documents", key=f"docs_{company.id}"):
                            st.info("Documents view coming soon!")
                    with col5:
                        if st.button("🕷️ Crawl", key=f"crawl_{company.id}"):
                            # Set the selected company for crawling and navigate to crawl page
                            st.session_state["selected_company_for_crawl"] = company.id
                            st.session_state["current_page"] = "start_crawling"
                            st.rerun()
                    with col6:
                        if st.button("✏️ Edit", key=f"edit_{company.id}"):
                            # Set the editing state
                            st.session_state[edit_key] = True
                            st.rerun()
                    with col7:
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
            unique_categories: set[str] = set()
            for company in companies:
                unique_categories.update(company.categories)
            st.metric("Unique Categories", len(unique_categories))

        # Tier visibility statistics
        st.write("---")
        st.subheader("Tier Visibility Statistics")

        col1, col2, col3, col4 = st.columns(4)

        with col1:
            # Count companies accessible to each tier
            free_accessible = len(
                [
                    c
                    for c in companies
                    if hasattr(c, "visible_to_tiers") and UserTier.FREE in c.visible_to_tiers
                ]
            )
            st.metric("Free Tier Accessible", free_accessible)

        with col2:
            business_accessible = len(
                [
                    c
                    for c in companies
                    if hasattr(c, "visible_to_tiers") and UserTier.BUSINESS in c.visible_to_tiers
                ]
            )
            st.metric("Business Tier Accessible", business_accessible)

        with col3:
            enterprise_accessible = len(
                [
                    c
                    for c in companies
                    if hasattr(c, "visible_to_tiers") and UserTier.ENTERPRISE in c.visible_to_tiers
                ]
            )
            st.metric("Enterprise Tier Accessible", enterprise_accessible)

        with col4:
            # Count premium-only companies (business+ only)
            premium_only = len(
                [
                    c
                    for c in companies
                    if hasattr(c, "visible_to_tiers") and UserTier.FREE not in c.visible_to_tiers
                ]
            )
            st.metric("Premium Only", premium_only)

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
        st.info("💡 **Troubleshooting tips:**")
        st.write("• Check that your MongoDB connection is working")
        st.write("• Verify your environment variables are set correctly")
        st.write("• Try restarting the Streamlit application")
