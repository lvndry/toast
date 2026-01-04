import shortuuid
import streamlit as st
from streamlit_tags import st_tags

from src.dashboard.db_utils import create_product_isolated, get_product_by_slug_isolated
from src.dashboard.utils import run_async_with_retry
from src.models.product import Product


def show_product_creation() -> None:
    st.title("Create New Product")

    # Show success message if product was just created
    if "product_created" in st.session_state and st.session_state.product_created:
        st.success(f"✅ Product '{st.session_state.product_created_name}' created successfully!")
        st.info(f"**Product ID:** `{st.session_state.product_created_id}`")
        st.info(f"**Product Slug:** `{st.session_state.product_created_slug}`")
        # Clear the success state after showing
        del st.session_state.product_created
        del st.session_state.product_created_name
        del st.session_state.product_created_id
        del st.session_state.product_created_slug

    with st.form("product_form"):
        name = st.text_input("Product Name", placeholder="Enter product name...")
        slug = st.text_input(
            "Product Slug", placeholder="Enter slug (optional, will auto-generate)"
        )
        domains = st_tags(
            label="Domains",
            text="Press enter to add more",
            value=[],
            suggestions=["example.com", "www.example.com"],
            maxtags=-1,
            key="domains_input",
        )
        categories = st_tags(
            label="Categories",
            text="Press enter to add more",
            value=[],
            suggestions=[
                "Technology",
                "SaaS",
                "Privacy",
                "Finance",
                "Healthcare",
                "E-commerce",
                "Social Media",
                "Education",
            ],
            maxtags=-1,
            key="categories_input",
        )
        crawl_base_urls = st_tags(
            label="Crawl Base URLs",
            text="Press enter to add more",
            value=[],
            suggestions=["https://example.com/privacy", "https://example.com/terms"],
            maxtags=-1,
            key="crawl_urls_input",
        )

        submitted = st.form_submit_button("Create Product", type="primary")

        if submitted:
            if not name.strip():
                st.error("Product name is required!")
                return

            try:
                # Generate slug if not provided
                final_slug = (
                    slug.strip()
                    if slug.strip()
                    else name.lower().replace(" ", "-").replace("&", "and")
                )

                # Check if slug already exists
                with st.spinner("Checking if product already exists..."):
                    existing_product = run_async_with_retry(
                        get_product_by_slug_isolated(final_slug)
                    )

                if existing_product is not None:
                    st.error(
                        f"Product with slug '{final_slug}' already exists. Please choose a different slug."
                    )
                    return

                # Parse form data
                # st_tags returns a list directly, no need to split
                domains_list = [domain.strip() for domain in domains if domain.strip()]
                categories_list = [category.strip() for category in categories if category.strip()]
                crawl_base_urls_list: list[str] = [
                    url.strip() for url in (crawl_base_urls or []) if url.strip()
                ]

                product = Product(
                    id=shortuuid.uuid(),
                    name=name.strip(),
                    slug=final_slug,
                    domains=domains_list,
                    categories=categories_list,
                    crawl_base_urls=crawl_base_urls_list,
                )

                # Save product to database with retry
                with st.spinner("Creating product..."):
                    success = run_async_with_retry(create_product_isolated(product))

                if success:
                    # Store success state in session to show after rerun
                    st.session_state.product_created = True
                    st.session_state.product_created_name = name.strip()
                    st.session_state.product_created_id = product.id
                    st.session_state.product_created_slug = product.slug

                    # Clear the form by rerunning
                    st.rerun()
                else:
                    st.error("Failed to create product. Please try again.")

            except Exception as e:
                st.error(f"Error creating product: {str(e)}")
                st.info("💡 **Troubleshooting tips:**")
                st.write("• Check that your MongoDB connection is working")
                st.write("• Verify your environment variables are set correctly")
                st.write("• Try refreshing the page and trying again")

