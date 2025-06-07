import asyncio
import os
from typing import AsyncGenerator

from dotenv import load_dotenv
from litellm import completion
from loguru import logger

from src.db import get_company_documents, update_document
from src.document import Document, DocumentAnalysis

load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")


async def summarize_all_company_documents(company_slug: str) -> str:
    documents = await get_company_documents(company_slug)
    logger.info(f"Summarizing {len(documents)} documents for {company_slug}")
    for doc in documents:
        analysis = await summarize_document(doc)
        doc.analysis = analysis
        logger.debug(f"Analysis: {analysis}")
        await update_document(doc)

    logger.info(f"Summarized {len(documents)} documents for {company_slug}")


async def summarize_document(document: Document) -> DocumentAnalysis:
    prompt = f"""You are a privacy-focused document summarizer.
Your task is to read and analyze this legal document and produce a comprehensive yet easy-to-understand summary, specifically for readers who care about how their data is handled.

Document content:
{document.text}

Please provide:

1. A detailed but clear summary of the document's **content and impact** on the user.
   - Focus on what the company does with user data.
   - Explain how these policies might affect the user's **experience**, **autonomy**, and **privacy**.
   - Highlight any permissions, restrictions, or surprises that could influence user trust or behavior.
   - Make sure the summary includes concrete examples of what data is collected, how it is used, whether it is shared or sold, and how it is protected.

2. A scoring section with values from 0 (poor) to 10 (excellent) for:
   - **Transparency**: How clearly and accessibly is the information communicated to a general audience?
   - **Data Usage**: How respectful is the policy in terms of data minimization, user control, and purpose limitation?

Use plain, precise language. Avoid legal jargon. Assume the reader is privacy-conscious but not a legal expert.
Always refer to the organization by name or as "the company." Never use "they" or "their" to avoid ambiguity.

Return your output as a JSON object with the following structure:

{{
  "summary": "A user-oriented explanation of what this document means in practice.",
  "scores": {{
      "transparency": number,
      "data_usage": number
  }},
  "key_points": [
    "Brief bullet points capturing the most relevant and impactful ideas",
    "Include things like data sharing, data rights, retention, or unexpected uses"
  ]
}}
"""

    system_prompt = """
You are a privacy-focused document summarizer that makes legal documents accessible to non-legal audiences.

Use plain, precise language. Avoid legal jargon. Assume the reader is privacy-conscious but not a legal expert.
Always refer to the organization by name or as "the company." Never use "they" or "their" to avoid ambiguity.
"""

    try:
        response = completion(
            model="mistral/mistral-small-latest",
            api_key=MISTRAL_API_KEY,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
        )

        summary_data = response.choices[0].message.content
        return DocumentAnalysis.model_validate_json(summary_data)
    except Exception as e:
        logger.error(f"Error summarizing document: {str(e)}")
        raise


async def generate_company_meta_summary(company_slug: str) -> AsyncGenerator[str, None]:
    """
    Generate a meta-summary of all analyzed documents for a company.

    Args:
        documents_with_analysis: List of documents that have analysis data

    Yields:
        str: Chunks of the generated meta-summary
    """
    summaries = []
    documents = await get_company_documents(company_slug)
    for doc in documents:
        doc_type = doc.doc_type
        summary = doc.analysis.summary
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
- Never use ambiguous pronouns like "they", "them", "their", "we", "us", or "our".
- Use a professional and warm and friendly tone. Don't need to say it's a meta-summary present it as a summary of the company's data practices.
- Only provide information that is directly supported by the documents.
- Don't make up information.
- Don't say you are a privacy expert. You are a helpful assistant created by toast.ai.

Write the summary in a clear, user-friendly way that helps privacy-conscious users understand the company's data practices."""

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
            api_key=MISTRAL_API_KEY,
        )

        for chunk in response:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    except Exception as e:
        logger.error(f"Error generating meta-summary: {str(e)}")
        yield "Error generating meta-summary. Please try again later."


async def main():
    await summarize_all_company_documents("notion")

    print("Generating company meta-summary:")
    print("=" * 50)
    async for chunk in generate_company_meta_summary("notion"):
        print(chunk, end="")
    print("\n" + "=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
