"""Document summarization module for privacy-focused analysis of legal documents."""

import asyncio

from dotenv import load_dotenv
from pydantic import BaseModel

from src.core.logging import get_logger
from src.document import Document, DocumentAnalysis
from src.llm import acompletion_with_fallback
from src.services.document_service import document_service

load_dotenv()
logger = get_logger(__name__)


class MetaSummaryScore(BaseModel):
    score: int
    justification: str


class MetaSummaryScores(BaseModel):
    transparency: MetaSummaryScore
    data_usage: MetaSummaryScore
    control_and_rights: MetaSummaryScore
    third_party_sharing: MetaSummaryScore


class MetaSummary(BaseModel):
    summary: str
    scores: MetaSummaryScores
    keypoints: list[str]


async def summarize_all_company_documents(company_slug: str) -> list[Document]:
    documents: list[Document] = await document_service.get_company_documents(company_slug)
    total_docs: int = len(documents)
    logger.info(f"Summarizing {total_docs} documents for {company_slug}")

    for index, doc in enumerate(documents, 1):
        logger.info(f"Processing document {index}/{total_docs}: {doc.title}")
        analysis = await summarize_document(doc)
        doc.analysis = analysis
        logger.debug(f"Analysis: {analysis}")
        await document_service.update_document(doc)
        logger.info(
            f"✓ Completed document {index}/{total_docs} ({(index / total_docs) * 100:.1f}%)"
        )

    logger.info(f"✓ Successfully summarized all {total_docs} documents for {company_slug}")
    return documents


async def summarize_document(document: Document) -> DocumentAnalysis | None:
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

3. keypoints: A list of concise, high-signal bullet points that capture:
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
  "keypoints": [
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
        response = await acompletion_with_fallback(
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
        # Ensure required keys exist; add defaults when missing
        try:
            parsed: DocumentAnalysis = DocumentAnalysis.model_validate_json(
                summary_data, strict=False
            )
            return parsed
        except Exception:
            # Fallback: wrap minimal structure if malformed
            parsed_fallback: DocumentAnalysis = DocumentAnalysis(
                summary="",
                scores={
                    "transparency": {"score": 0, "justification": ""},
                    "data_usage": {"score": 0, "justification": ""},
                },
                keypoints=[],
            )
            return parsed_fallback
    except Exception as e:
        logger.error(f"Error summarizing document: {str(e)}")
        return None


async def generate_company_meta_summary(company_slug: str) -> MetaSummary:
    """
    Generate a meta-summary of all analyzed documents for a company.

    Args:
        company_slug: The company slug to generate meta-summary for

    Returns:
        MetaSummary: The generated meta-summary
    """
    documents = await document_service.get_company_documents_by_slug(company_slug)
    logger.info(f"Generating meta-summary for {company_slug} with {len(documents)} documents")

    summaries = []
    for doc in documents:
        doc_type = doc.doc_type

        # Ensure we have an analysis (use existing or generate)
        analysis = doc.analysis
        if not analysis:
            logger.info(f"Generating analysis for document {doc.id} ({doc.title})")
            analysis = await summarize_document(doc)
            if analysis:
                # Store the analysis in the database
                doc.analysis = analysis
                await document_service.update_document(doc)
                logger.info(f"✓ Stored analysis for document {doc.id}")

        # Format the analysis text (or add placeholder if no analysis)
        if analysis:
            summary = analysis.summary
            keypoints = analysis.keypoints
            analysis_text = f"""Document Type: {doc_type}
Summary: {summary}

"""
            if keypoints:
                analysis_text += "\nKey Points:\n"
                for point in keypoints:
                    analysis_text += f"  • {point}\n"
            summaries.append(analysis_text)
        else:
            logger.warning(f"Failed to generate analysis for document {doc.id}")
            summaries.append(f"Document Type: {doc_type}\nNo analysis available\n")

    document_summaries = "\n---\n".join(summaries)
    logger.debug(f"Document summaries: {document_summaries}")

    SYSTEM_PROMPT = """
You are a privacy-focused document summarizer designed to make legal documents—especially privacy policies and terms of service—clear and accessible to non-expert, privacy-conscious users.

Your job is to extract and explain the real-world implications of these documents, focusing on how the company collects, uses, shares, retains, and protects user data.

CRITICAL: You must ONLY use information explicitly stated in the provided documents. Never infer, assume, or add information that is not directly present in the source material.

Style and Language Guidelines:
- Use plain, precise, and human-centered language. Avoid legal or technical jargon.
- Always refer to the organization by its full name or as "the company."
- Never use ambiguous pronouns like "they," "them," or "their."
- Assume the reader is privacy-aware but not a lawyer or policy expert.
- Prioritize clarity, honesty, and practical insight over word-for-word fidelity to legal phrasing.
- Structure the summary in a way that is easy to understand and follow with paragraphs and spacing.

Analytical Guidelines:
- ONLY analyze what is explicitly stated in the provided documents. Do not make assumptions or fill in gaps.
- If information is missing, vague, or unclear, explicitly state this rather than guessing or inferring.
- Focus on user impact: what users should expect, what rights they have, what risks or benefits they face.
- Be especially attentive to data collection, use, sharing, third-party access, retention, security, and user rights when mentioned in the document.
- Identify any permissions granted to the company or obligations imposed on users that are explicitly stated.
- Highlight any potentially surprising, invasive, or beneficial aspects found in the document.
- Never speculate. If a detail is unclear or missing, say so explicitly (e.g., "The document does not specify how long data is retained").

Cognitive Process:
- Think through your analysis carefully and double-check that every statement can be traced back to the source document.
- Before including any detail, verify it exists in the provided context.
- If the context lacks enough information to answer confidently, explicitly state what is missing rather than fabricating information.

Handling Missing Documents:
- If no document is provided, respond with: "No privacy policy or terms of service document was provided. Please provide a document to analyze."
- If a document is provided but lacks specific information (e.g., no mention of data retention), state this explicitly in your summary.

Expected Output Format:

1. summary: A detailed yet plain-language explanation of the document's content and impact on the user.
   - Clearly describe the implications for the user's privacy, autonomy, and overall experience.
   - Structure the summary in a way that is easy to understand and follow with paragraphs and spacing.
   - The summary should be easy to digest and understand.
   - Highlight any permissions granted to the company, restrictions placed on the company, and any practices that might surprise or concern a typical user.
   - Include specific examples (when available) of:
     - What data is collected (e.g., location, browsing history, payment info)
     - How it is used (e.g., personalization, advertising, analytics)
     - Whether it is shared, sold, or transferred to third parties
     - How long data is retained and how it is secured
     - Any user rights (e.g., opt-out, access, deletion) and how to exercise them

2. scores: An object with values from 0 (poor) to 10 (excellent)

3. keypoints: A list of concise, high-signal bullet points that capture:
   - The most important or unique data practices
   - Any red flags, surprises, or safeguards worth highlighting
   - Notable user rights, obligations, or risks
   - 15 bullet points max ordered by importance

{{
  "summary": "A detailed yet plain-language explanation of the document's content and impact on the user, based ONLY on information present in the provided documents.

   Structure:
   - Clearly describe the implications for the user's privacy, autonomy, and overall experience based on what is stated.
   - Use paragraphs and spacing for readability.
   - Highlight permissions granted to the company, restrictions placed on the company, and practices that might surprise users.
   - When specific details are provided, include examples of:
     * What data is collected (e.g., location, browsing history, payment info)
     * How it is used (e.g., personalization, advertising, analytics)
     * Whether it is shared, sold, or transferred to third parties
     * How long data is retained and how it is secured
     * User rights (e.g., opt-out, access, deletion) and how to exercise them

   - For any category where information is not provided in the document, explicitly state: 'The document does not specify [missing information].'",
  "scores": {{
    "transparency": {{
      "score": number (0-10),
      "justification": "1-2 sentences explaining how clear and understandable the documents are, based only on what is present. If the document is missing key information, this should lower the score."
    }},
    "data_usage": {{
      "score": number (0-10),
      "justification": "1-2 sentences explaining whether the company limits data use to what's necessary, based only on stated practices. If unclear or not specified, note this."
    }},
    "control_and_rights": {{
        "score": number (0-10),
        "justification": "1-2 sentences on how much control users have over their data, based only on explicitly stated rights."
    }},
    "third_party_sharing": {{
        "score": number (0-10),
        "justification": "1-2 sentences on how often and how transparently data is shared externally, based only on what the document states."
    }}
  }},
  "keypoints": [
    "Maximum 15 bullet points, ordered by importance"
    ""Key findings extracted ONLY from the provided document, presented as clear, concise bullet points.",
    "Include what personal data is collected (if specified)",
    "Whether data is sold or shared with third parties (if specified)",
    "How long data is stored and how it's protected (if specified)",
    "User rights such as delete, correct, or access (if specified)",
    "Surprising permissions or obligations (if present)",
    "Whether consent is opt-in or opt-out (if specified)",
    "Note if the document uses vague or overly broad language",
    "For any missing information, include bullet points like: 'Data retention period: Not specified'",
  ]
}}
"""

    prompt = f"""
Your task is to create a clear and accessible summary of the of the following document summaries:

{document_summaries}
"""

    try:
        response = await acompletion_with_fallback(
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.5,
            response_format=MetaSummary,
        )

        logger.debug(response.choices[0].message.content)

        return MetaSummary.model_validate_json(response.choices[0].message.content, strict=False)  # type: ignore
    except Exception as e:
        logger.error(f"Error generating meta-summary: {str(e)}")
        return MetaSummary(
            summary="",
            scores=MetaSummaryScores(
                transparency=MetaSummaryScore(score=0, justification=""),
                data_usage=MetaSummaryScore(score=0, justification=""),
                control_and_rights=MetaSummaryScore(score=0, justification=""),
                third_party_sharing=MetaSummaryScore(score=0, justification=""),
            ),
            keypoints=[],
        )


async def main() -> None:
    await summarize_all_company_documents("notion")

    print("Generating company meta-summary:")
    print("=" * 50)
    meta_summary = await generate_company_meta_summary("notion")
    logger.info(meta_summary)
    print("\n" + "=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
