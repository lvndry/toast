import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from litellm import completion
from loguru import logger

from src.db import get_all_companies, get_company_by_slug, mongo

router = APIRouter(prefix="/companies")


@router.get("")
async def get_companies():
    """Get all companies."""
    companies = await get_all_companies()
    return {"companies": companies}


@router.get("/slug/{slug}")
async def get_company(slug: str):
    """Get a company by its slug."""
    try:
        company = await get_company_by_slug(slug)
        return company
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/meta-summary/{company_id}")
async def get_company_meta_summary(company_id: str):
    """Get a meta-summary of all documents for a company."""
    # First verify the company exists
    company = await mongo.db.companies.find_one({"id": company_id})
    if not company:
        raise HTTPException(
            status_code=404, detail=f"Company with ID {company_id} not found"
        )

    # Get all documents for the company
    documents = await mongo.db.documents.find({"company_id": company_id}).to_list(
        length=None
    )
    if not documents:
        raise HTTPException(
            status_code=404, detail=f"No documents found for company {company_id}"
        )

    # Filter documents that have analysis
    documents_with_analysis = [doc for doc in documents if doc.get("analysis")]
    if not documents_with_analysis:
        raise HTTPException(
            status_code=404,
            detail=f"No analyzed documents found for company {company_id}",
        )

    # Create a prompt with all document summaries
    summaries = []
    for doc in documents_with_analysis:
        doc_type = doc.get("doc_type", "unknown")
        summary = doc["analysis"]["summary"]
        summaries.append(f"Document Type: {doc_type}\nSummary: {summary}\n")

    document_summaries = "\n---\n".join(summaries)
    prompt = f"""You are a privacy-focused document analyst.
Your name is toast AI. You are created by toast.ai.
Your task is to create a comprehensive meta-summary of all the company's legal documents.

Here are the summaries of individual documents:

{document_summaries}

Please create a meta-summary that:
1. Synthesizes the key points across all documents
2. Highlights any contradictions or inconsistencies
3. Provides an overall assessment of the company's data handling practices
4. Identifies the most important privacy and data usage considerations for users

Tone:

- NEVER say you belong to the company. You are created by toast.ai. You role is to help users understand data practices of the company in the query.
- Never use ambiguous pronouns like “they”, “them”, “their”, “we”, “us”, or “our”.
- Use a professional and warm and friendly tone. Don't need to say it's a meta-summary present it as a summary of the company's data practices.
- Only provide information that is directly supported by the documents.
- Don't make up information.
- Don't say you are a privacy expert. You are a helpful assistant created by toast.ai.

Write the summary in a clear, user-friendly way that helps privacy-conscious users understand the company's data practices."""

    async def generate_summary():
        try:
            response = completion(
                model="mistral/mistral-large-latest",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a privacy-focused document analyst that creates clear, user-friendly summaries of websites legal documents (privacy policy, terms of service, etc.).",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                stream=True,
                api_key=os.getenv("MISTRAL_API_KEY"),
            )

            for chunk in response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            logger.error(f"Error generating meta-summary: {str(e)}")
            yield "Error generating meta-summary. Please try again later."

    return StreamingResponse(generate_summary(), media_type="text/plain")


@router.get("/{company_id}")
async def get_company_by_id(company_id: str):
    """Get a company by its ID."""
    company = await mongo.db.companies.find_one({"id": company_id})
    if not company:
        raise HTTPException(
            status_code=404, detail=f"Company with ID {company_id} not found"
        )
    return company
