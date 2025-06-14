"""Document summarization module for privacy-focused analysis of legal documents."""

import asyncio

from dotenv import load_dotenv
from litellm import acompletion
from loguru import logger

from src.db import get_company_documents, update_document
from src.document import Document, DocumentAnalysis
from src.models import get_model

load_dotenv()


async def summarize_all_company_documents(company_slug: str) -> str:
    documents = await get_company_documents(company_slug)
    total_docs = len(documents)
    logger.info(f"Summarizing {total_docs} documents for {company_slug}")

    for index, doc in enumerate(documents, 1):
        logger.info(f"Processing document {index}/{total_docs}: {doc.title}")
        analysis = await summarize_document(doc)
        doc.analysis = analysis
        logger.debug(f"Analysis: {analysis}")
        await update_document(doc)
        logger.info(
            f"✓ Completed document {index}/{total_docs} ({(index / total_docs) * 100:.1f}%)"
        )

    logger.info(
        f"✓ Successfully summarized all {total_docs} documents for {company_slug}"
    )


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
    "transparency": Score, // Clarity and accessibility of the language
    "data_usage": Score, // Respect for data minimization and purpose limitation
    "control_and_rights": Score,   // How much control the user has (opt-in/out, delete, correct)
    "third_party_sharing": Score, // How often data is shared with third parties
  }},
  "key_points": [
    "What personal data is collected and why",
    "Whether data is sold or shared with third parties",
    "How long data is stored and how it's protected",
    "User rights (delete, correct, access, etc.)",
    "Surprising permissions or obligations",
    "Whether consent is opt-in or opt-out",
    "Whether the document uses vague or overly broad language",
    ...
  ]
}}

Score is a JSON object with the following fields:
{{
    "score": number, // 0-10
    "justification": "...", // 1-2 sentences
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
        model = get_model("gemini-2.0-flash")
        response = await acompletion(
            model=model.model,
            api_key=model.api_key,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.5,
        )
        summary_data = response.choices[0].message.content
        return DocumentAnalysis.model_validate_json(summary_data, strict=False)
    except Exception as e:
        logger.error(f"Error summarizing document: {str(e)}")
        return None


async def generate_company_meta_summary(company_slug: str) -> DocumentAnalysis:
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
        summary = doc.analysis.summary if doc.analysis else ""
        summaries.append(f"Document Type: {doc_type}\nSummary: {summary}\n")

    document_summaries = "\n---\n".join(summaries)

    prompt = f"""
Your task is to create a clear and accessible summary of the company’s data practices based on the following document summaries:

{document_summaries}

The audience is privacy-conscious users with little or no legal background. Your job is to help them understand what the company does with their data, what rights they have, and any noteworthy risks — in simple, direct language.

Write in a tone that is professional, calm, and easy to read. Use short paragraphs and structured sections.

**Instructions:**

- Do not introduce yourself.
- Do not refer to "we", "us", "our", "they", "them", or "their".
- Always refer to the company by its full name (e.g., “Notion Labs, Inc.”).
- Include only what is explicitly supported by the documents — do not speculate or add extra interpretation.

**Format your response as follows:**

1. A plain-language summary divided into clear and relevant sections.
Example structure:
   - **What Data Is Collected**
   - **How the Data Is Used**
   - **Who the Data Is Shared With**
   - **How the Data Is Stored and Protected**
   - **User Rights and Controls**
   - **Notable Clauses or Surprising Terms**
   - **Overall Assessment**

   If there are contradictions or inconsistencies across documents, highlight them in the relevant section.

2. Follow the summary with this structured JSON output:

{{
    "summary": "...",
    "scores": {{
      "transparency": {{
        "score": number (0-10),
        "justification": "1-2 sentences explaining how clear and understandable the documents are."
      }},
    "data_usage": {{
      "score": number (0-10),
      "justification": "1-2 sentences explaining whether the company limits data use to what's necessary."
      }},
    "control_and_rights": {{
        "score": number (0-10),
        "justification": "1-2 sentences on how much control users have over their data."
      }},
    "third_party_sharing": {{
        "score": number (0-10),
        "justification": "1-2 sentences on how often and how transparently data is shared externally."
      }}
    }},
    "key_points": [
        "What personal data is collected and for what purpose",
        "Whether data is sold or shared with third parties",
        "How long data is stored and how it's protected",
        "What rights users have (delete, access, correct, etc.)",
        "Any surprising permissions, risks, or responsibilities",
        "Whether user consent is opt-in or opt-out",
        "Whether the documents use vague, broad, or confusing language"
    ]
}}
"""

    SYSTEM_PROMPT = """
You arg a privacy-focused document analyst who creates clear, user-friendly summaries of website legal documents such as privacy policies, terms of service, and related texts.

Your role is to help non-expert but privacy-conscious users understand what they are agreeing to, in plain, accessible language.

You produce structured reports that:
- Synthesize key information across documents about how the company collects, uses, shares, and protects user data.
- Highlight user rights, permissions, obligations, and any contradictions or surprising terms.
- Avoid legal jargon unless absolutely necessary, and explain it clearly when used.
- Never speculate — include only what is directly supported by the documents.
- Refer to the company by name or as "the company" — never use ambiguous pronouns like "they" or "we."
- Use a warm, professional tone focused on empowerment and clarity.
- Provide transparency, data usage, user control, and third-party sharing scores with clear justification.
- Do not introduce yourself to the user.

Your summaries are created by toast.ai to support user understanding of data practices — never suggest affiliation with the company being analyzed.
"""

    try:
        model = get_model("gemini-2.0-flash")
        response = await acompletion(
            model=model.model,
            api_key=model.api_key,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.5,
            response_format={"type": "json_object"},
        )

        logger.debug(response.choices[0].message.content)

        return DocumentAnalysis.model_validate_json(
            response.choices[0].message.content, strict=False
        )
    except Exception as e:
        logger.error(f"Error generating meta-summary: {str(e)}")
        return None


async def main():
    await summarize_all_company_documents("notion")

    print("Generating company meta-summary:")
    print("=" * 50)
    meta_summary = await generate_company_meta_summary("notion")
    logger.info(meta_summary)
    print("\n" + "=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
