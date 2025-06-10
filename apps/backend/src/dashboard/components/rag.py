import streamlit as st

from src.dashboard.db_utils import get_all_companies_isolated
from src.dashboard.utils import run_async
from src.rag import get_answer


def show_rag():
    st.title("RAG Question Answering")

    # Get list of companies from the database
    companies = run_async(get_all_companies_isolated())

    if companies is None:
        st.error("Error fetching companies")
        return

    # Company selection
    selected_company = st.selectbox(
        "Select a company", [company.slug for company in companies]
    )

    # Question input
    question = st.text_area("Enter your question about the company:", height=100)

    if st.button("Get Answer"):
        if question:
            with st.spinner("Generating answer..."):
                try:
                    answer = run_async(get_answer(question, selected_company))
                    st.write("Answer:")
                    st.write(answer)
                except Exception as e:
                    st.error(f"Error generating answer: {str(e)}")
        else:
            st.warning("Please enter a question.")
