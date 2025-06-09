import streamlit as st

from src.dashboard.components.company_creation import show_company_creation
from src.dashboard.components.company_view import show_company_view
from src.dashboard.components.crawling import show_crawling
from src.dashboard.components.embedding import show_embedding

st.set_page_config(page_title="Toast Dashboard", page_icon="🍞", layout="wide")


def main():
    st.sidebar.title("Navigation")

    # Check if we have a current page in session state
    current_page = st.session_state.get("current_page", "View Companies")

    # Create page options
    page_options = [
        "Create Company",
        "View Companies",
        "Start Crawling",
        "Generate Embeddings",
        "Settings",
    ]

    # Find the index of the current page
    try:
        default_index = page_options.index(current_page)
    except ValueError:
        default_index = 1  # Default to "View Companies"

    page = st.sidebar.radio("Go to", page_options, index=default_index)

    # Update session state
    st.session_state["current_page"] = page

    if page == "Create Company":
        show_company_creation()
    elif page == "View Companies":
        show_company_view()
    elif page == "Start Crawling":
        show_crawling()
    elif page == "Generate Embeddings":
        show_embedding()
    else:
        st.title("Settings")
        st.info("This feature is coming soon!")


if __name__ == "__main__":
    main()
