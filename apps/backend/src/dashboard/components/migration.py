import asyncio
import time
from typing import Any, Dict, Optional

import aiohttp
import streamlit as st


async def make_api_request(
    session: aiohttp.ClientSession,
    url: str,
    method: str = "GET",
    data: Optional[Dict[str, Any]] = None,
):
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


def run_async(coro):
    """Helper to run async functions in Streamlit"""
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop.run_until_complete(coro)


async def get_migration_summary_async(api_url: str):
    """Async function to get migration summary"""
    async with aiohttp.ClientSession() as session:
        return await make_api_request(session, f"{api_url}/toast/migration/summary")


async def run_migration_async(
    api_url: str, endpoint: str, data: Optional[Dict[str, Any]] = None
):
    """Async function to run migration operations"""
    async with aiohttp.ClientSession() as session:
        return await make_api_request(session, f"{api_url}{endpoint}", "POST", data)


def show_migration():
    st.title("Database Migration")
    st.markdown("Migrate data from localhost to production database")

    # Configuration section
    st.header("Configuration")

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Local Database")
        local_uri = st.text_input(
            "Local MongoDB URI",
            value=st.secrets.get("MONGO_URI", ""),
            type="password",
            help="MongoDB connection string for local database",
        )

    with col2:
        st.subheader("Production Database")
        production_uri = st.text_input(
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
                        st.error(
                            f"Failed to get summary: {result.get('message', 'Unknown error')}"
                        )
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
    st.warning(
        "⚠️ This will actually migrate data to production. Make sure you have a backup!"
    )

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
        st.info(
            "Please confirm that you understand the migration will modify production data."
        )

    # Migration History
    if "migration_results" in st.session_state:
        st.header("Migration Results")

        for result in st.session_state["migration_results"]:
            with st.expander(f"{result['timestamp']} - {result['action']}"):
                st.json(result["data"])


def run_migration(
    api_url: str, endpoint: str, action: str, data: Optional[Dict[str, Any]] = None
):
    """Helper function to run migration operations"""
    if not api_url:
        st.error("Please provide API Base URL")
        return

    try:
        with st.spinner(f"Running {action}..."):
            result, status_code = run_async(
                run_migration_async(api_url, endpoint, data)
            )

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
                    st.error(
                        f"{action} failed: {result.get('message', 'Unknown error')}"
                    )
            else:
                st.error(f"API request failed with status {status_code}")

    except Exception as e:
        st.error(f"Error running {action}: {str(e)}")


def display_migration_results(data: Dict[str, Any]):
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
                st.metric(
                    "Companies (Production)", companies.get("production_count", 0)
                )

            with col2:
                documents = summary["collections"].get("documents", {})
                st.metric("Documents (Local)", documents.get("local_count", 0))
                st.metric(
                    "Documents (Production)", documents.get("production_count", 0)
                )

            with col3:
                meta_summaries = summary["collections"].get("meta_summaries", {})
                st.metric(
                    "Meta Summaries (Local)", meta_summaries.get("local_count", 0)
                )
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
