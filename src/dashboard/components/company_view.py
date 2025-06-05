import streamlit as st

from src.dashboard.db_utils import get_all_companies_isolated
from src.dashboard.utils import run_async


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
                col3, col4, col5 = st.columns(3)
                with col3:
                    if st.button("📊 View Analytics", key=f"analytics_{company.id}"):
                        st.info("Analytics feature coming soon!")
                with col4:
                    if st.button("📄 View Documents", key=f"docs_{company.id}"):
                        st.info("Documents view coming soon!")
                with col5:
                    if st.button("✏️ Edit", key=f"edit_{company.id}"):
                        st.info("Edit feature coming soon!")

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
