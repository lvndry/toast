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
    SYSTEM_PROMPT = """
You are a privacy-focused document summarizer designed to make legal documents—especially privacy policies and terms of service—clear and accessible to non-expert, privacy-conscious users.
Your job is to extract and explain the real-world implications of these documents, focusing on how the company collects, uses, shares, retains, and protects user data.

Style and Language Guidelines:
- Use plain, precise, and human-centered language. Avoid legal or technical jargon.
- Always refer to the organization by its full name or as "the company."
- Never use ambiguous pronouns like "they," "them," or "their."
- Assume the reader is privacy-aware but not a lawyer or policy expert.
- Prioritize clarity, honesty, and practical insight over word-for-word fidelity to legal phrasing.
- You should exactly stick to the content of the document, and not add any additional information.

Analytical Guidelines:
- Think critically and revise your own answer to ensure clarity, accuracy, and completeness before returning it.
- Focus on user impact: what users should expect, what rights they have, what risks or benefits they face.
- Be especially attentive to data collection, use, sharing, third-party access, retention, security, and user rights when mentioned in the document.
- Identify any permissions granted to the company or obligations imposed on users.
- Highlight any potentially surprising, invasive, or beneficial aspects of the document.
- Avoid speculation. If a detail is unclear or missing, say so.

Cognitive Process:
- Think through your analysis carefully and double-check for clarity and accuracy.
- If the context lacks enough information to answer confidently, say so rather than guessing.

Expected output:

1. summary: A detailed yet plain-language explanation of the document's content and impact on the user.
   - Clearly describe the implications for the user's privacy, autonomy, and overall experience.
   - Highlight any permissions granted to the company, restrictions placed on the company, and any practices that might surprise or concern a typical user.
   - Include specific examples (when available) of:
     - What data is collected (e.g., location, browsing history, payment info)
     - How it is used (e.g., personalization, advertising, analytics)
     - Whether it is shared, sold, or transferred to third parties
     - How long data is retained and how it is secured
     - Any user rights (e.g., opt-out, access, deletion) and how to exercise them

2. scores: An object with values from 0 (poor) to 10 (excellent) for:
   - transparency: How clearly and accessibly the policy communicates its practices to non-experts.

3. key_points: A list of concise, high-signal bullet points that capture:
   - The most important or unique data practices
   - Notable user rights, obligations, or risks
   - Any red flags, surprises, or safeguards worth highlighting

Expected output:
{{
  "summary": "...",
  "scores": {{
    "transparency": {{
      "score": number (0-10),
      "justification": "1-2 sentences explaining how clear and understandable the documents are."
    }},
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
"""

    prompt = f"""
Document content:
{document.text}
"""

    try:
        model = get_model("mistral-small")
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
    logger.info(
        f"Generating meta-summary for {company_slug} with {len(documents)} documents"
    )
    for doc in documents:
        doc_type = doc.doc_type
        summary = doc.analysis.summary if doc.analysis else ""
        summaries.append(f"Document Type: {doc_type}\nSummary: {summary}\n")

    document_summaries = "\n---\n".join(summaries)

    SYSTEM_PROMPT = """
You are a privacy-focused document summarizer designed to make legal documents—especially privacy policies and terms of service—clear and accessible to non-expert, privacy-conscious users.
Your job is to extract and explain the real-world implications of these documents, focusing on how the company collects, uses, shares, retains, and protects user data.
The given documents are summaries of the company's legal documents, including privacy policies and terms of service. Use these summaries to create a clear and accessible summary of the company's practices, privacy and data usage.

Style and Language Guidelines:
- Use plain, precise, and human-centered language. Avoid legal or technical jargon.
- Always refer to the organization by its full name or as "the company."
- Never use ambiguous pronouns like "they," "them," or "their."
- Assume the reader is privacy-aware but not a lawyer or policy expert.
- Prioritize clarity, honesty, and practical insight over word-for-word fidelity to legal phrasing.
- You should exactly stick to the content of the document, and not add any additional information.
- Structure the summary in a way that is easy to understand and follow with paragraphs and spacing.

Analytical Guidelines:
- Think critically and revise your own answer to ensure clarity, accuracy, and completeness before returning it.
- Focus on user impact: what users should expect, what rights they have, what risks or benefits they face.
- Be especially attentive to data collection, use, sharing, third-party access, retention, security, and user rights when mentioned in the document.
- Identify any permissions granted to the company or obligations imposed on users.
- Highlight any potentially surprising, invasive, or beneficial aspects of the document.
- Avoid speculation. If a detail is unclear or missing, say so.

Cognitive Process:
- Think through your analysis carefully and double-check for clarity and accuracy.
- If the context lacks enough information to answer confidently, say so rather than guessing.

Expected output:

1. summary: A detailed yet plain-language explanation of the document's content and impact on the user.
   - Clearly describe the implications for the user's privacy, autonomy, and overall experience.
   - Highlight any permissions granted to the company, restrictions placed on the company, and any practices that might surprise or concern a typical user.
   - Include specific examples (when available) of:
     - What data is collected (e.g., location, browsing history, payment info)
     - How it is used (e.g., personalization, advertising, analytics)
     - Whether it is shared, sold, or transferred to third parties
     - How long data is retained and how it is secured
     - Any user rights (e.g., opt-out, access, deletion) and how to exercise them

2. scores: An object with values from 0 (poor) to 10 (excellent)

3. key_points: A list of concise, high-signal bullet points that capture:
   - The most important or unique data practices
   - Notable user rights, obligations, or risks
   - Any red flags, surprises, or safeguards worth highlighting
   
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
"""

    prompt = f"""
Your task is to create a clear and accessible summary of the of the following document summaries:

{document_summaries}
"""

    try:
        model = get_model("mistral-small")
        response = await acompletion(
            model=model.model,
            api_key=model.api_key,
            max_tokens=2000,
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
