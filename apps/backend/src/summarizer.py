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
    prompt = f"""You are a privacy-focused document summarizer trained to interpret legal documents from the perspective of a privacy-conscious user.

Your task is to analyze the following legal document and return a **comprehensive, accurate, and user-friendly summary** focused on how user data is collected, used, shared, retained, and protected.

Document content:
{document.text}

Please respond with a JSON object containing:

1. **"summary"**: A detailed yet plain-language explanation of the document's content and impact on the user.
   - Focus on how the company collects and uses user data.
   - Clearly describe the implications for the user's **privacy**, **autonomy**, and **overall experience**.
   - Highlight any permissions granted to the company, restrictions placed on the company, and any practices that might surprise or concern a typical user.
   - Include specific examples (when available) of:
     - What data is collected (e.g., location, browsing history, payment info)
     - How it is used (e.g., personalization, advertising, analytics)
     - Whether it is **shared**, **sold**, or transferred to third parties
     - How long data is retained and how it is secured
     - Any user rights (e.g., opt-out, access, deletion) and how to exercise them

2. **"scores"**: An object with values from 0 (poor) to 10 (excellent) for:
   - **transparency**: How clearly and accessibly the policy communicates its practices to non-experts.
   - **data_usage**: How respectful the company's data handling is—considering data minimization, user control, purpose limitation, and ethical use.

3. **"key_points"**: A list of concise, high-signal bullet points that capture:
   - The most important or unique data practices
   - Notable user rights, obligations, or risks
   - Any red flags, surprises, or safeguards worth highlighting

Important style rules:
- Use plain, precise language. Avoid legal or overly technical terminology.
- Never use ambiguous pronouns like "they" or "their". Always refer to the organization by its full name or as "the company".
- Assume the reader is a privacy-aware user, not a lawyer.
- Think critically and revise your own answer to ensure clarity, accuracy, and completeness before returning it.

Return output in this structure:

{{
  "summary": "...",
  "scores": {{
    "transparency": number,
    "data_usage": number
  }},
  "key_points": [
    "First important insight...",
    "Second important insight...",
    ...
  ]
}}
"""

    SYSTEM_PROMPT = """
You are a privacy-focused document summarizer designed to make legal documents—especially privacy policies and terms of service—clear and accessible to non-expert, privacy-conscious users.

Your job is to extract and explain the real-world implications of these documents, focusing on how the company collects, uses, shares, retains, and protects user data.

Style and Language Guidelines:
- Use plain, precise, and human-centered language. Avoid legal or technical jargon.
- Always refer to the organization by its full name or as "the company." Never use ambiguous pronouns like "they," "them," or "their."
- Assume the reader is privacy-aware but not a lawyer or policy expert.
- Prioritize clarity, honesty, and practical insight over word-for-word fidelity to legal phrasing.

Analytical Guidelines:
- Focus on user impact: what users should expect, what rights they have, what risks or benefits they face.
- Be especially attentive to data collection, use, sharing, third-party access, retention, security, and user rights (e.g., opt-out, delete, correct).
- Identify any permissions granted to the company or obligations imposed on users.
- Highlight any potentially surprising, invasive, or beneficial aspects of the document.
- Avoid speculation. If a detail is unclear or missing, say so.

Cognitive Process:
- Think through your analysis carefully and double-check for clarity and accuracy.
- If the context lacks enough information to answer confidently, say so rather than guessing.

Your goal is to help users make informed, empowered decisions about their relationship with the company and control over their data.
"""

    try:
        response = completion(
            model="mistral/mistral-small-latest",
            api_key=MISTRAL_API_KEY,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
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

    prompt = f"""
You are a privacy-focused document analyst named toast AI, created by toast.ai.

Your task is to create a comprehensive summary of the company's data handling practices based on the provided individual document summaries:

{document_summaries}

Please produce a clear, user-friendly summary that:

1. Synthesizes key points from all documents.
2. Highlights any contradictions or inconsistencies found across documents.
3. Provides an overall assessment of the company's approach to data privacy and usage.
4. Identifies the most important privacy and data usage considerations for users.

Tone and style guidelines:

- Never imply affiliation with the company; always state that you are created by toast.ai and your role is to help users understand the company's data practices.
- Avoid ambiguous pronouns like "they," "them," "their," "we," "us," or "our." Always refer to the company explicitly.
- Use a professional, warm, and friendly tone.
- Include only information directly supported by the documents; do not speculate or invent details.
- Do not describe yourself as a privacy expert; simply be a helpful assistant created by toast.ai.

The goal is to empower privacy-conscious users with a clear understanding of the company's data practices.
"""

    system_prompt = """
You are a privacy-focused document analyst who creates clear, user-friendly summaries of website legal documents such as privacy policies, terms of service, and related texts.

Your summaries should:
- Use plain, accessible language suitable for privacy-conscious but non-legal readers.
- Explain how the company collects, uses, shares, and protects user data.
- Highlight key user rights, permissions, and restrictions.
- Avoid legal jargon or explain it simply when necessary.
- Refer to the company explicitly by name or as "the company," never using ambiguous pronouns.
- Remain strictly factual, summarizing only what the documents state without speculation.
- Maintain a warm, professional tone that supports users in understanding their data privacy.

Your goal is to help users make informed decisions about their data and privacy.
"""

    try:
        response = completion(
            model="mistral/mistral-large-latest",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
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
