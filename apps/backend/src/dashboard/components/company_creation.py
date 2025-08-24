import shortuuid
import streamlit as st

from src.company import Company
from src.dashboard.db_utils import create_company_isolated, get_company_by_slug_isolated
from src.dashboard.utils import run_async_with_retry


def show_company_creation():
    st.title("Create New Company")

    with st.form("company_form"):
        name = st.text_input("Company Name", placeholder="Enter company name...")
        slug = st.text_input(
            "Company Slug", placeholder="Enter slug (optional, will auto-generate)"
        )
        domains = st.text_area("Domains (one per line)", placeholder="example.com\nwww.example.com")
        categories = st.text_area(
            "Categories (one per line)", placeholder="Technology\nSaaS\nPrivacy"
        )
        crawl_base_urls = st.text_area(
            "Crawl Base URLs (one per line)",
            placeholder="https://example.com/privacy\nhttps://example.com/terms",
        )

        submitted = st.form_submit_button("Create Company", type="primary")

        if submitted:
            if not name.strip():
                st.error("Company name is required!")
                return

            try:
                # Generate slug if not provided
                final_slug = (
                    slug.strip()
                    if slug.strip()
                    else name.lower().replace(" ", "-").replace("&", "and")
                )

                # Check if slug already exists
                with st.spinner("Checking if company already exists..."):
                    existing_company = run_async_with_retry(
                        get_company_by_slug_isolated(final_slug)
                    )

                if existing_company is not None:
                    st.error(
                        f"Company with slug '{final_slug}' already exists. Please choose a different slug."
                    )
                    return

                # Parse form data
                domains_list = [domain.strip() for domain in domains.split("\n") if domain.strip()]
                categories_list = [
                    category.strip() for category in categories.split("\n") if category.strip()
                ]
                crawl_base_urls_list = (
                    [url.strip() for url in crawl_base_urls.split("\n") if url.strip()]
                    if crawl_base_urls.strip()
                    else None
                )

                company = Company(
                    id=shortuuid.uuid(),
                    name=name.strip(),
                    slug=final_slug,
                    domains=domains_list,
                    categories=categories_list,
                    crawl_base_urls=crawl_base_urls_list,
                )

                # Save company to database with retry
                with st.spinner("Creating company..."):
                    success = run_async_with_retry(create_company_isolated(company))

                if success:
                    st.success(f"✅ Company '{name}' created successfully!")
                    st.info(f"**Company ID:** `{company.id}`")
                    st.info(f"**Company Slug:** `{company.slug}`")

                    # Clear the form by rerunning
                    st.rerun()
                else:
                    st.error("Failed to create company. Please try again.")

            except Exception as e:
                st.error(f"Error creating company: {str(e)}")
                st.info("💡 **Troubleshooting tips:**")
                st.write("• Check that your MongoDB connection is working")
                st.write("• Verify your environment variables are set correctly")
                st.write("• Try refreshing the page and trying again")
