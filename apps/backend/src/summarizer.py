"""Document summarization module for privacy-focused analysis of legal documents."""

import asyncio

from dotenv import load_dotenv
from pydantic import BaseModel

from src.core.logging import get_logger
from src.document import Document, DocumentAnalysis
from src.llm import acompletion_with_fallback
from src.prompts.summarizer_prompts import (
    DOCUMENT_SUMMARY_SYSTEM_PROMPT,
    META_SUMMARY_SYSTEM_PROMPT,
)
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
    prompt = f"""
Document content:
{document.text}
"""

    try:
        response = await acompletion_with_fallback(
            messages=[
                {
                    "role": "system",
                    "content": DOCUMENT_SUMMARY_SYSTEM_PROMPT,
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

    prompt = f"""
Your task is to create a clear and accessible summary of the of the following document summaries:

{document_summaries}
"""

    try:
        response = await acompletion_with_fallback(
            messages=[
                {
                    "role": "system",
                    "content": META_SUMMARY_SYSTEM_PROMPT,
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
