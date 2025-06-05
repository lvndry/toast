import streamlit as st

from src.dashboard.components.company_creation import show_company_creation
from src.dashboard.components.company_view import show_company_view

st.set_page_config(page_title="Toast Dashboard", page_icon="🍞", layout="wide")


def main():
    st.sidebar.title("Navigation")
    page = st.sidebar.radio("Go to", ["Create Company", "View Companies", "Settings"])

    if page == "Create Company":
        show_company_creation()
    elif page == "View Companies":
        show_company_view()
    else:
        st.title("Settings")
        st.info("This feature is coming soon!")


if __name__ == "__main__":
    main()
