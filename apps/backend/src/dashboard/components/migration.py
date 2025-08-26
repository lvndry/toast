import asyncio
import time
from collections.abc import Coroutine
from typing import Any

import aiohttp
import streamlit as st

from src.dashboard.db_utils import get_all_companies_isolated, update_company_isolated
from src.dashboard.utils import run_async_with_retry
from src.user import UserTier


async def make_api_request(
    session: aiohttp.ClientSession,
    url: str,
    method: str = "GET",
    data: dict[str, Any] | None = None,
) -> tuple[dict[str, Any], int]:
    """Helper function to make async HTTP requests"""
    try:
        if method.upper() == "GET":
            async with session.get(url) as response:
                return await response.json(), response.status
        elif method.upper() == "POST":
            async with session.post(url, json=data) as response:
                return await response.json(), response.status
    except Exception as e:
        return {"error": str(e)}, 500
    return {"error": "Unknown error"}, 500


def run_async(coro: Coroutine[Any, Any, Any]) -> Any:
    """Helper to run async functions in Streamlit"""
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop.run_until_complete(coro)


async def get_migration_summary_async(api_url: str) -> tuple[dict[str, Any], int]:
    """Async function to get migration summary"""
    async with aiohttp.ClientSession() as session:
        return await make_api_request(session, f"{api_url}/toast/migration/summary")


async def run_migration_async(
    api_url: str, endpoint: str, data: dict[str, Any] | None = None
) -> tuple[dict[str, Any], int]:
    """Async function to run migration operations"""
    async with aiohttp.ClientSession() as session:
        return await make_api_request(session, f"{api_url}{endpoint}", "POST", data)


def show_migration() -> None:
    st.title("Database Migration")
    st.markdown("Migrate data from localhost to production database")

    # Configuration section
    st.header("Configuration")

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Local Database")
        _local_uri = st.text_input(
            "Local MongoDB URI",
            value=st.secrets.get("MONGO_URI", ""),
            type="password",
            help="MongoDB connection string for local database",
        )

    with col2:
        st.subheader("Production Database")
        _production_uri = st.text_input(
            "Production MongoDB URI",
            value=st.secrets.get("PRODUCTION_MONGO_URI", ""),
            type="password",
            help="MongoDB connection string for production database",
        )

    # API Configuration
    st.subheader("API Configuration")
    api_url = st.text_input(
        "API Base URL", value="http://localhost:8000", help="Base URL for the Toast API"
    )

    # Migration Summary
    st.header("Migration Summary")

    if st.button("Get Migration Summary", type="primary"):
        if not api_url:
            st.error("Please provide API Base URL")
            return

        try:
            with st.spinner("Fetching migration summary..."):
                result, status_code = run_async(get_migration_summary_async(api_url))

                if status_code == 200:
                    if result.get("success"):
                        summary = result.get("data", {})

                        st.success("Migration summary retrieved successfully!")

                        # Display summary
                        col1, col2, col3 = st.columns(3)

                        with col1:
                            st.metric(
                                "Companies (Local)",
                                summary.get("collections", {})
                                .get("companies", {})
                                .get("local_count", 0),
                            )
                            st.metric(
                                "Companies (Production)",
                                summary.get("collections", {})
                                .get("companies", {})
                                .get("production_count", 0),
                            )

                        with col2:
                            st.metric(
                                "Documents (Local)",
                                summary.get("collections", {})
                                .get("documents", {})
                                .get("local_count", 0),
                            )
                            st.metric(
                                "Documents (Production)",
                                summary.get("collections", {})
                                .get("documents", {})
                                .get("production_count", 0),
                            )

                        with col3:
                            st.metric(
                                "Meta Summaries (Local)",
                                summary.get("collections", {})
                                .get("meta_summaries", {})
                                .get("local_count", 0),
                            )
                            st.metric(
                                "Meta Summaries (Production)",
                                summary.get("collections", {})
                                .get("meta_summaries", {})
                                .get("production_count", 0),
                            )

                        # Store summary in session state
                        st.session_state["migration_summary"] = summary

                        # Show detailed summary
                        with st.expander("Detailed Summary"):
                            st.json(summary)
                    else:
                        st.error(f"Failed to get summary: {result.get('message', 'Unknown error')}")
                else:
                    st.error(f"API request failed with status {status_code}")

        except Exception as e:
            st.error(f"Error fetching migration summary: {str(e)}")

    # Migration Actions
    st.header("Migration Actions")

    # Dry Run Section
    st.subheader("Dry Run")
    st.info(
        "A dry run will show you what would be migrated without actually performing the migration."
    )

    col1, col2, col3 = st.columns(3)

    with col1:
        if st.button("Dry Run - All Data"):
            run_migration(api_url, "/toast/migration/dry-run", "Full dry run migration")

    with col2:
        if st.button("Dry Run - Companies Only"):
            run_migration(
                api_url,
                "/toast/migration/migrate-companies",
                "Companies dry run migration",
                {"dry_run": True},
            )

    with col3:
        if st.button("Dry Run - Documents Only"):
            run_migration(
                api_url,
                "/toast/migration/migrate-documents",
                "Documents dry run migration",
                {"dry_run": True},
            )

    # Actual Migration Section
    st.subheader("Execute Migration")
    st.warning("⚠️ This will actually migrate data to production. Make sure you have a backup!")

    # Confirmation checkbox
    migration_confirmed = st.checkbox(
        "I understand this will migrate data to production and I have a backup"
    )

    if migration_confirmed:
        col1, col2, col3 = st.columns(3)

        with col1:
            if st.button("Migrate All Data", type="secondary"):
                run_migration(
                    api_url,
                    "/toast/migration/execute",
                    "Full migration",
                    {"dry_run": False},
                )

        with col2:
            if st.button("Migrate Companies Only", type="secondary"):
                run_migration(
                    api_url,
                    "/toast/migration/migrate-companies",
                    "Companies migration",
                    {"dry_run": False},
                )

        with col3:
            if st.button("Migrate Documents Only", type="secondary"):
                run_migration(
                    api_url,
                    "/toast/migration/migrate-documents",
                    "Documents migration",
                    {"dry_run": False},
                )
    else:
        st.info("Please confirm that you understand the migration will modify production data.")

    # Migration History
    if "migration_results" in st.session_state:
        st.header("Migration Results")

        for result in st.session_state["migration_results"]:
            with st.expander(f"{result['timestamp']} - {result['action']}"):
                st.json(result["data"])


def run_migration(
    api_url: str, endpoint: str, action: str, data: dict[str, Any] | None = None
) -> None:
    """Helper function to run migration operations"""
    if not api_url:
        st.error("Please provide API Base URL")
        return

    try:
        with st.spinner(f"Running {action}..."):
            result, status_code = run_async(run_migration_async(api_url, endpoint, data))

            if status_code == 200:
                if result.get("success"):
                    st.success(f"{action} completed successfully!")

                    # Store result in session state
                    if "migration_results" not in st.session_state:
                        st.session_state["migration_results"] = []

                    st.session_state["migration_results"].append(
                        {
                            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                            "action": action,
                            "data": result.get("data", {}),
                        }
                    )

                    # Display results
                    with st.expander(f"Results for {action}"):
                        display_migration_results(result.get("data", {}))
                else:
                    st.error(f"{action} failed: {result.get('message', 'Unknown error')}")
            else:
                st.error(f"API request failed with status {status_code}")

    except Exception as e:
        st.error(f"Error running {action}: {str(e)}")


def display_migration_results(data: dict[str, Any]) -> None:
    """Display migration results in a formatted way"""
    if not data:
        st.info("No data to display")
        return

    # Summary section
    if "summary" in data:
        st.subheader("Summary")
        summary = data["summary"]

        if "collections" in summary:
            col1, col2, col3 = st.columns(3)

            with col1:
                companies = summary["collections"].get("companies", {})
                st.metric("Companies (Local)", companies.get("local_count", 0))
                st.metric("Companies (Production)", companies.get("production_count", 0))

            with col2:
                documents = summary["collections"].get("documents", {})
                st.metric("Documents (Local)", documents.get("local_count", 0))
                st.metric("Documents (Production)", documents.get("production_count", 0))

            with col3:
                meta_summaries = summary["collections"].get("meta_summaries", {})
                st.metric("Meta Summaries (Local)", meta_summaries.get("local_count", 0))
                st.metric(
                    "Meta Summaries (Production)",
                    meta_summaries.get("production_count", 0),
                )

    # Migration results
    st.subheader("Migration Results")

    # Check if this is a single collection result or full migration result
    if "migrated_count" in data and "skipped_count" in data:
        # Single collection result (e.g., documents only, companies only)
        result = data
        collection_name = "Migration"  # Generic name for single collection

        with st.expander(f"{collection_name}"):
            col1, col2, col3 = st.columns(3)

            with col1:
                st.metric("Migrated", result.get("migrated_count", 0))

            with col2:
                st.metric("Skipped", result.get("skipped_count", 0))

            with col3:
                st.metric("Errors", len(result.get("errors", [])))

            if result.get("errors"):
                st.error("Errors occurred:")
                for error in result["errors"]:
                    st.text(f"• {error}")

            if result.get("dry_run"):
                st.info("This was a dry run - no actual data was migrated")
            else:
                st.success("Data was successfully migrated")
    else:
        # Full migration result with multiple collections
        for collection_name, result in data.items():
            if (
                collection_name != "summary"
                and collection_name != "dry_run"
                and collection_name != "timestamp"
            ):
                with st.expander(f"{collection_name.title()} Migration"):
                    col1, col2, col3 = st.columns(3)

                    with col1:
                        st.metric("Migrated", result.get("migrated_count", 0))

                    with col2:
                        st.metric("Skipped", result.get("skipped_count", 0))

                    with col3:
                        st.metric("Errors", len(result.get("errors", [])))

                    if result.get("errors"):
                        st.error("Errors occurred:")
                        for error in result["errors"]:
                            st.text(f"• {error}")

                    if result.get("dry_run"):
                        st.info("This was a dry run - no actual data was migrated")
                    else:
                        st.success("Data was successfully migrated")

    # Tier Visibility Migration Section
    st.write("---")
    st.header("Tier Visibility Management")
    st.markdown("Manage which user tiers can access specific companies")

    # Get current companies
    try:
        with st.spinner("Loading companies..."):
            companies = run_async_with_retry(get_all_companies_isolated())

        if companies is None:
            st.error("Failed to load companies from database.")
            return

        if not companies:
            st.info("No companies found. Create some companies first!")
            return

        st.success(f"✅ Loaded {len(companies)} companies")

        # Bulk tier visibility operations
        st.subheader("Bulk Tier Visibility Operations")

        col1, col2 = st.columns(2)

        with col1:
            st.write("**Make All Companies Accessible to All Tiers**")
            if st.button("🔄 Reset All to Free", type="secondary"):
                try:
                    with st.spinner("Updating all companies..."):
                        updated_count = 0
                        for company in companies:
                            company.visible_to_tiers = [
                                UserTier.FREE,
                                UserTier.BUSINESS,
                                UserTier.ENTERPRISE,
                            ]
                            success = run_async_with_retry(update_company_isolated(company))
                            if success:
                                updated_count += 1

                        if updated_count == len(companies):
                            st.success(
                                f"✅ All {updated_count} companies are now accessible to all tiers!"
                            )
                        else:
                            st.warning(f"⚠️ Updated {updated_count}/{len(companies)} companies")
                except Exception as e:
                    st.error(f"Error updating companies: {str(e)}")

        with col2:
            st.write("**Add Tier Visibility Fields to Missing Companies**")
            if st.button("🔧 Fix Missing Tier Fields", type="secondary"):
                try:
                    with st.spinner("Checking for missing tier fields..."):
                        missing_tier_fields = [
                            c
                            for c in companies
                            if not hasattr(c, "visible_to_tiers") or not c.visible_to_tiers
                        ]

                        if not missing_tier_fields:
                            st.info("✅ All companies already have tier visibility fields!")
                        else:
                            st.info(
                                f"Found {len(missing_tier_fields)} companies without tier fields"
                            )

                            for company in missing_tier_fields:
                                company.visible_to_tiers = [
                                    UserTier.FREE,
                                    UserTier.BUSINESS,
                                    UserTier.ENTERPRISE,
                                ]
                                run_async_with_retry(update_company_isolated(company))

                            st.success(
                                f"✅ Added tier fields to {len(missing_tier_fields)} companies!"
                            )
                except Exception as e:
                    st.error(f"Error fixing tier fields: {str(e)}")

        # Strategic tier assignments
        st.subheader("Strategic Tier Assignments")

        # Define company categories for strategic gating
        st.write("**Premium Content Strategy**")
        st.info("Make high-value companies premium-only to drive conversions")

        col1, col2, col3 = st.columns(3)

        with col1:
            if st.button("🔒 Make Social Media Premium", type="primary"):
                try:
                    with st.spinner("Making social media companies premium..."):
                        social_companies = [
                            "facebook",
                            "tiktok",
                            "instagram",
                            "twitter",
                            "linkedin",
                            "snapchat",
                        ]
                        updated_count = 0

                        for company in companies:
                            if company.slug in social_companies:
                                company.visible_to_tiers = [UserTier.BUSINESS, UserTier.ENTERPRISE]
                                success = run_async_with_retry(update_company_isolated(company))
                                if success:
                                    updated_count += 1

                        st.success(f"✅ Made {updated_count} social media companies premium-only!")
                except Exception as e:
                    st.error(f"Error updating social media companies: {str(e)}")

        with col2:
            if st.button("🔒 Make Data Brokers Premium", type="primary"):
                try:
                    with st.spinner("Making data broker companies premium..."):
                        data_brokers = ["palantir", "snowflake", "databricks", "splunk"]
                        updated_count = 0

                        for company in companies:
                            if company.slug in data_brokers:
                                company.visible_to_tiers = [UserTier.BUSINESS, UserTier.ENTERPRISE]
                                success = run_async_with_retry(update_company_isolated(company))
                                if success:
                                    updated_count += 1

                        st.success(f"✅ Made {updated_count} data broker companies premium-only!")
                except Exception as e:
                    st.error(f"Error updating data broker companies: {str(e)}")

        with col3:
            if st.button("🔒 Make Financial Services Premium", type="primary"):
                try:
                    with st.spinner("Making financial services companies premium..."):
                        financial_companies = ["stripe", "paypal", "square", "robinhood"]
                        updated_count = 0

                        for company in companies:
                            if company.slug in financial_companies:
                                company.visible_to_tiers = [UserTier.BUSINESS, UserTier.ENTERPRISE]
                                success = run_async_with_retry(update_company_isolated(company))
                                if success:
                                    updated_count += 1

                        st.success(
                            f"✅ Made {updated_count} financial services companies premium-only!"
                        )
                except Exception as e:
                    st.error(f"Error updating financial services companies: {str(e)}")

        # Custom tier assignment
        st.subheader("Custom Tier Assignment")

        # Company selector
        company_options = {f"{c.name} ({c.slug})": c.slug for c in companies}
        selected_company = st.selectbox(
            "Select Company",
            options=list(company_options.keys()),
            help="Choose a company to modify its tier visibility",
        )

        if selected_company:
            company_slug = company_options[selected_company]
            company = next((c for c in companies if c.slug == company_slug), None)

            if company:
                current_tiers = (
                    company.visible_to_tiers
                    if hasattr(company, "visible_to_tiers")
                    else [UserTier.FREE, UserTier.BUSINESS, UserTier.ENTERPRISE]
                )

                st.write(f"**Current tier visibility for {company.name}:**")
                tier_labels = []
                for tier in current_tiers:
                    if tier == UserTier.FREE:
                        tier_labels.append("🟢 Free")
                    elif tier == UserTier.BUSINESS:
                        tier_labels.append("🔵 Business")
                    elif tier == UserTier.ENTERPRISE:
                        tier_labels.append("🟣 Enterprise")

                st.info(f"Current: {', '.join(tier_labels)}")

                # Tier selection
                st.write("**Set new tier visibility:**")
                col1, col2, col3 = st.columns(3)

                with col1:
                    free_tier = st.checkbox("🟢 Free Tier", value=UserTier.FREE in current_tiers)
                with col2:
                    business_tier = st.checkbox(
                        "🔵 Business Tier", value=UserTier.BUSINESS in current_tiers
                    )
                with col3:
                    enterprise_tier = st.checkbox(
                        "🟣 Enterprise Tier", value=UserTier.ENTERPRISE in current_tiers
                    )

                if st.button("Update Tier Visibility", type="primary"):
                    if not any([free_tier, business_tier, enterprise_tier]):
                        st.error("At least one tier must be selected!")
                    else:
                        try:
                            new_tiers = []
                            if free_tier:
                                new_tiers.append(UserTier.FREE)
                            if business_tier:
                                new_tiers.append(UserTier.BUSINESS)
                            if enterprise_tier:
                                new_tiers.append(UserTier.ENTERPRISE)

                            company.visible_to_tiers = new_tiers
                            success = run_async_with_retry(update_company_isolated(company))

                            if success:
                                st.success(f"✅ Updated {company.name} tier visibility!")
                                st.rerun()
                            else:
                                st.error("Failed to update company tier visibility")
                        except Exception as e:
                            st.error(f"Error updating company: {str(e)}")

        # Tier visibility statistics
        st.subheader("Current Tier Visibility Statistics")

        col1, col2, col3, col4 = st.columns(4)

        with col1:
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
            premium_only = len(
                [
                    c
                    for c in companies
                    if hasattr(c, "visible_to_tiers") and UserTier.FREE not in c.visible_to_tiers
                ]
            )
            st.metric("Premium Only", premium_only, delta=f"{premium_only}/{len(companies)}")

    except Exception as e:
        st.error(f"Error loading companies: {str(e)}")
        st.write("Please check your database connection and try again.")
