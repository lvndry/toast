import warnings

import streamlit as st

from src.core.logging import setup_logging
from src.dashboard.components.company_creation import show_company_creation
from src.dashboard.components.company_view import show_company_view
from src.dashboard.components.crawling import show_crawling
from src.dashboard.components.deep_analysis import show_deep_analysis
from src.dashboard.components.embedding import show_embedding
from src.dashboard.components.migration import show_migration
from src.dashboard.components.rag import show_rag
from src.dashboard.components.summarization import show_summarization

# Suppress Streamlit ScriptRunContext warnings globally
warnings.filterwarnings("ignore", message="missing ScriptRunContext")


st.set_page_config(page_title="Toast Dashboard", page_icon="🍞", layout="wide")

setup_logging()


def main() -> None:
    st.sidebar.title("Navigation")

    # Create page options with id and display_name
    page_options = [
        {"id": "create_company", "display_name": "Create Company"},
        {"id": "view_companies", "display_name": "View Companies"},
        {"id": "start_crawling", "display_name": "Start Crawling"},
        {"id": "generate_embeddings", "display_name": "Generate & Store Embeddings"},
        {"id": "summarization", "display_name": "Summarization"},
        {"id": "deep_analysis", "display_name": "Deep Analysis & Overview"},
        {"id": "rag", "display_name": "RAG"},
        {"id": "migration", "display_name": "Migration"},
        {"id": "settings", "display_name": "Settings"},
    ]

    # Check if we have a current page in session state
    current_page_id = st.session_state.get("current_page", "view_companies")

    # Migration: Handle legacy display names in session state
    # Map old display names to new page IDs for backward compatibility
    legacy_page_mapping = {
        "Create Company": "create_company",
        "View Companies": "view_companies",
        "Start Crawling": "start_crawling",
        "Generate Embeddings": "generate_embeddings",
        "Generate & Store Embeddings": "generate_embeddings",
        "Summarization": "summarization",
        "Deep Analysis & Overview": "deep_analysis",
        "RAG": "rag",
        "Migration": "migration",
        "Settings": "settings",
    }

    # If current_page_id is a legacy display name, convert it to page ID
    if current_page_id in legacy_page_mapping:
        current_page_id = legacy_page_mapping[current_page_id]
        st.session_state["current_page"] = current_page_id

    # Find the index of the current page
    try:
        default_index = next(
            i for i, option in enumerate(page_options) if option["id"] == current_page_id
        )
    except StopIteration:
        # If page ID is invalid, default to "View Companies"
        default_index = 1
        current_page_id = "view_companies"
        st.session_state["current_page"] = current_page_id

    # Extract display names for the radio button
    display_names = [option["display_name"] for option in page_options]
    selected_display_name = st.sidebar.radio("Go to", display_names, index=default_index)

    # Find the selected page option
    selected_option = next(
        option for option in page_options if option["display_name"] == selected_display_name
    )
    page_id = selected_option["id"]

    # Update session state with id
    st.session_state["current_page"] = page_id

    if page_id == "create_company":
        show_company_creation()
    elif page_id == "view_companies":
        show_company_view()
    elif page_id == "start_crawling":
        show_crawling()
    elif page_id == "generate_embeddings":
        show_embedding()
    elif page_id == "summarization":
        show_summarization()
    elif page_id == "deep_analysis":
        show_deep_analysis()
    elif page_id == "rag":
        show_rag()
    elif page_id == "migration":
        show_migration()
    else:
        st.title("Settings")
        st.info("This feature is coming soon!")


if __name__ == "__main__":
    main()
