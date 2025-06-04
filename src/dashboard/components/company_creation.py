import shortuuid
import streamlit as st

from src.company import Company
from src.db import mongo


async def show_company_creation():
    st.title("Create New Company")

    with st.form("company_form"):
        name = st.text_input("Company Name")
        slug = st.text_input("Company Slug")
        domains = st.text_input("Domains (comma-separated)")
        categories = st.text_input("Categories (comma-separated)")
        crawl_base_urls = st.text_input("Crawl Base URLs (comma-separated)")

        submitted = st.form_submit_button("Create Company")

        if submitted:
            try:
                domains_list = [domain.strip() for domain in domains.split(",")]
                categories_list = [
                    category.strip() for category in categories.split(",")
                ]
                crawl_base_urls_list = (
                    [url.strip() for url in crawl_base_urls.split(",")]
                    if crawl_base_urls
                    else None
                )

                # Create company instance
                company = Company(
                    id=shortuuid.uuid(),
                    name=name,
                    slug=slug or name.lower().replace(" ", ""),
                    domains=domains_list,
                    categories=categories_list,
                    crawl_base_urls=crawl_base_urls_list,
                )

                # Save company to database
                await mongo.db.companies.insert_one(company.model_dump())

                st.success(f"Company created successfully! ID: {company.id}")
            except Exception as e:
                st.error(f"Error creating company: {str(e)}")
