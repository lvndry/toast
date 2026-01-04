import shortuuid
import streamlit as st
from streamlit_tags import st_tags

from src.dashboard.db_utils import create_product_isolated, get_product_by_slug_isolated
from src.dashboard.utils import run_async_with_retry
from src.models.product import Product


def _reset_product_form_fields() -> None:
    """Clear all product form inputs so the user can immediately create another."""
    defaults: dict[str, str | list[str]] = {
        "product_name_input": "",
        "company_name_input": "",
        "product_slug_input": "",
        "domains_input": [],
        "categories_input": [],
        "crawl_urls_input": [],
    }
    for key, default in defaults.items():
        st.session_state[key] = default.copy() if isinstance(default, list) else default


def _render_tags(key: str, label: str, suggestions: list[str]) -> list[str]:
    """Render a tags input, wiring the session_state default if present."""
    return st_tags(
        label=label,
        text="Press enter to add more",
        value=st.session_state.get(key, []),
        suggestions=suggestions,
        maxtags=-1,
        key=key,
    )


def _restore_preserved_values() -> None:
    """Restore preserved form values before widgets are created (avoids widget key mutation)."""
    if not st.session_state.get("preserve_form_values"):
        return

    if "preserved_product_name" in st.session_state:
        st.session_state.product_name_input = st.session_state.preserved_product_name
    if "preserved_company_name" in st.session_state:
        st.session_state.company_name_input = st.session_state.preserved_company_name
    if "preserved_product_slug" in st.session_state:
        st.session_state.product_slug_input = st.session_state.preserved_product_slug
    if "preserved_domains" in st.session_state:
        st.session_state.domains_input = st.session_state.preserved_domains.copy()
    if "preserved_categories" in st.session_state:
        st.session_state.categories_input = st.session_state.preserved_categories.copy()
    if "preserved_crawl_urls" in st.session_state:
        st.session_state.crawl_urls_input = st.session_state.preserved_crawl_urls.copy()

    # Clear the preserve flag and preserved values
    del st.session_state.preserve_form_values
    for k in (
        "preserved_product_name",
        "preserved_company_name",
        "preserved_product_slug",
        "preserved_domains",
        "preserved_categories",
        "preserved_crawl_urls",
    ):
        if k in st.session_state:
            del st.session_state[k]


def _preserve_form_values(
    product_id: str,
    product_name: str,
    company_name: str | None,
    product_slug: str,
    domains: list[str],
    categories: list[str],
    crawl_urls: list[str],
) -> None:
    """Save product success metadata and preserve form values across a rerun."""
    st.session_state.product_created = True
    st.session_state.product_created_name = product_name.strip()
    st.session_state.product_created_id = product_id
    st.session_state.product_created_slug = product_slug

    st.session_state.preserve_form_values = True
    st.session_state.preserved_product_name = product_name.strip()
    st.session_state.preserved_company_name = company_name.strip() if company_name else ""
    st.session_state.preserved_product_slug = product_slug.strip()
    st.session_state.preserved_domains = domains
    st.session_state.preserved_categories = categories
    st.session_state.preserved_crawl_urls = crawl_urls


def show_product_creation() -> None:
    st.title("Create New Product")

    # Restore any preserved values before widgets are created
    _restore_preserved_values()

    # Show success message if product was just created
    if "product_created" in st.session_state and st.session_state.product_created:
        st.success(f"✅ Product '{st.session_state.product_created_name}' created successfully!")
        st.info(f"**Product ID:** `{st.session_state.product_created_id}`")
        st.info(f"**Product Slug:** `{st.session_state.product_created_slug}`")

        if st.button("Create Other", type="secondary"):
            _reset_product_form_fields()
            st.rerun()

        # Clear the success state after showing
        del st.session_state.product_created
        del st.session_state.product_created_name
        del st.session_state.product_created_id
        del st.session_state.product_created_slug

    with st.form("product_form"):
        name = st.text_input(
            "Product Name", placeholder="Enter product name...", key="product_name_input"
        )
        company_name = st.text_input(
            "Company Name",
            placeholder="Enter company name (optional)...",
            key="company_name_input",
        )
        slug = st.text_input(
            "Product Slug",
            placeholder="Enter slug (optional, will auto-generate)",
            key="product_slug_input",
        )
        domains = _render_tags("domains_input", "Domains", ["example.com", "www.example.com"])
        categories = _render_tags(
            "categories_input",
            "Categories",
            [
                "Technology",
                "SaaS",
                "Privacy",
                "Finance",
                "Healthcare",
                "E-commerce",
                "Social Media",
                "Education",
            ],
        )
        crawl_base_urls = _render_tags(
            "crawl_urls_input",
            "Crawl Base URLs",
            ["https://example.com/privacy", "https://example.com/terms"],
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
                company_name_value = company_name.strip() if company_name.strip() else None

                product = Product(
                    id=shortuuid.uuid(),
                    name=name.strip(),
                    company_name=company_name_value,
                    slug=final_slug,
                    domains=domains_list,
                    categories=categories_list,
                    crawl_base_urls=crawl_base_urls_list,
                )

                # Save product to database with retry
                with st.spinner("Creating product..."):
                    success = run_async_with_retry(create_product_isolated(product))

                if success:
                    # Store success state and preserve values across rerun
                    _preserve_form_values(
                        product.id,
                        name,
                        company_name,
                        slug,
                        domains_list,
                        categories_list,
                        crawl_base_urls_list,
                    )

                    # Rerun to show success message (form values will be preserved)
                    st.rerun()
                else:
                    st.error("Failed to create product. Please try again.")

            except Exception as e:
                st.error(f"Error creating product: {str(e)}")
                st.info("💡 **Troubleshooting tips:**")
                st.write("• Check that your MongoDB connection is working")
                st.write("• Verify your environment variables are set correctly")
                st.write("• Try refreshing the page and trying again")
