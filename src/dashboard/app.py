import asyncio

import streamlit as st

from src.dashboard.components.company_creation import show_company_creation

st.set_page_config(page_title="Toast Dashboard", page_icon="🍞", layout="wide")


async def main():
    st.sidebar.title("Navigation")
    page = st.sidebar.radio("Go to", ["Create Company", "View Companies", "Settings"])

    if page == "Create Company":
        await show_company_creation()
    elif page == "View Companies":
        st.title("View Companies")
        st.info("This feature is coming soon!")
    else:
        st.title("Settings")
        st.info("This feature is coming soon!")


if __name__ == "__main__":
    asyncio.run(main())
