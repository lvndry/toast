import shortuuid
import streamlit as st

from src.company import Company
from src.dashboard.db_utils import create_company_isolated, get_company_by_slug_isolated
from src.dashboard.utils import run_async


def show_company_creation():
    st.title("Create New Company")

    with st.form("company_form"):
        name = st.text_input("Company Name")
        slug = st.text_input("Company Slug")
        domains = st.text_area("Domains (one per line)")
        categories = st.text_area("Categories (one per line)")
        crawl_base_urls = st.text_area("Crawl Base URLs (one per line)")

        submitted = st.form_submit_button("Create Company")

        if submitted:
            try:
                # Generate slug if not provided
                final_slug = slug or name.lower().replace(" ", "")

                # Check if slug already exists
                existing_company = run_async(get_company_by_slug_isolated(final_slug))
                if existing_company is not None:
                    st.error(
                        f"Company with slug '{final_slug}' already exists. Please choose a different slug."
                    )
                    return

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
                    if crawl_base_urls
                    else None
                )

                company = Company(
                    id=shortuuid.uuid(),
                    name=name,
                    slug=final_slug,
                    domains=domains_list,
                    categories=categories_list,
                    crawl_base_urls=crawl_base_urls_list,
                )

                # Save company to database
                success = run_async(create_company_isolated(company))

                if success:
                    st.success(f"Company created successfully! ID: {company.id}")
                else:
                    st.error("Failed to create company")

            except Exception as e:
                st.error(f"Error creating company: {str(e)}")
