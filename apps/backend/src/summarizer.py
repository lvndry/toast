"""Document summarization module for privacy-focused analysis of legal documents."""

import asyncio
import hashlib
from datetime import datetime
from typing import Literal

from dotenv import load_dotenv
from pydantic import BaseModel

from src.core.logging import get_logger
from src.document import Document, DocumentAnalysis, DocumentAnalysisScores
from src.llm import SupportedModel, acompletion_with_fallback
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
    data_collection_scope: MetaSummaryScore
    user_control: MetaSummaryScore
    third_party_sharing: MetaSummaryScore


class MetaSummary(BaseModel):
    summary: str
    scores: MetaSummaryScores
    risk_score: int
    verdict: Literal["safe", "caution", "review", "avoid"]
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


def _compute_document_hash(document: Document) -> str:
    """Compute a hash for the document content to enable caching."""
    content = f"{document.text}{document.doc_type}"
    return hashlib.sha256(content.encode()).hexdigest()


def _calculate_risk_score(scores: dict[str, DocumentAnalysisScores]) -> int:
    """
    Calculate overall risk score from component scores.
    Uses weighted average: transparency (20%), data_collection_scope (25%), user_control (25%), third_party_sharing (30%)
    Lower component scores = higher risk, so risk_score = 10 - weighted_average
    """
    weights = {
        "transparency": 0.20,
        "data_collection_scope": 0.25,
        "user_control": 0.25,
        "third_party_sharing": 0.30,
    }

    weighted_sum = 0.0
    total_weight = 0.0

    for score_name, weight in weights.items():
        if score_name in scores:
            score_value = scores[score_name].score
            weighted_sum += score_value * weight
            total_weight += weight

    if total_weight == 0:
        return 5  # Default middle score if no scores available

    # Calculate weighted average
    weighted_avg = weighted_sum / total_weight

    # Risk score: lower component scores = higher risk
    # So risk_score = 10 - weighted_average (inverted)
    risk_score = round(10 - weighted_avg)
    return max(0, min(10, risk_score))  # Clamp to 0-10


def _calculate_verdict(risk_score: int) -> Literal["safe", "caution", "review", "avoid"]:
    """Calculate verdict from risk score."""
    if risk_score <= 3:
        return "safe"
    elif risk_score <= 6:
        return "caution"
    elif risk_score <= 8:
        return "review"
    else:
        return "avoid"


def _ensure_required_scores(parsed: DocumentAnalysis) -> DocumentAnalysis:
    """
    Ensure all required scores are present and calculate risk_score/verdict if missing.
    """
    # Ensure all required core scores are present
    required_scores = [
        "transparency",
        "data_collection_scope",
        "user_control",
        "third_party_sharing",
    ]
    for score_name in required_scores:
        if score_name not in parsed.scores:
            parsed.scores[score_name] = DocumentAnalysisScores(
                score=0, justification="Score not provided by model"
            )

    # Calculate risk_score if not provided
    if not hasattr(parsed, "risk_score") or parsed.risk_score is None:
        parsed.risk_score = _calculate_risk_score(parsed.scores)

    # Calculate verdict if not provided or doesn't match risk_score
    if not hasattr(parsed, "verdict") or parsed.verdict is None:
        parsed.verdict = _calculate_verdict(parsed.risk_score)
    else:
        # Verify verdict matches risk_score (recalculate if mismatch)
        expected_verdict = _calculate_verdict(parsed.risk_score)
        if parsed.verdict != expected_verdict:
            logger.warning(
                f"Verdict '{parsed.verdict}' doesn't match risk_score {parsed.risk_score}, "
                f"recalculating to '{expected_verdict}'"
            )
            parsed.verdict = expected_verdict

    return parsed


def should_use_reasoning_model(document: Document) -> bool:
    """
    Determine if a reasoning/complex model should be used for legal analysis.

    This function is provider-agnostic and helps select appropriate model complexity
    based on document characteristics, making it resilient to provider or model changes.
    """
    # Use reasoning models for complex documents or high-stakes document types
    doc_length = len(document.text)
    complex_doc_types = ["terms_of_service", "data_processing_agreement", "terms_and_conditions"]

    # Use reasoning model if document is large (>50K chars) or is a complex type
    return doc_length > 50000 or document.doc_type in complex_doc_types


def _get_model_priority(document: Document) -> list[SupportedModel]:
    """Get model priority list based on document complexity."""
    if should_use_reasoning_model(document):
        # For complex documents, prefer reasoning models (provider-agnostic)
        # The fallback chain will select the best available reasoning model
        return ["gpt-5-mini", "grok-4-fast-reasoning", "gemini-2.5-flash"]
    else:
        # For simpler documents, use cost-effective models
        return ["gpt-5-mini", "grok-4-fast-non-reasoning", "gemini-2.5-flash"]


async def summarize_document(
    document: Document,
    use_cache: bool = True,
    max_retries: int = 3,
) -> DocumentAnalysis | None:
    """
    Summarize a document with caching, retry logic, and optimized model selection.

    Args:
        document: The document to summarize
        use_cache: Whether to check for cached analysis
        max_retries: Maximum number of retry attempts

    Returns:
        DocumentAnalysis or None if summarization fails
    """
    # Check cache if enabled and document already has analysis
    if use_cache and document.analysis:
        # Compute current document hash
        current_hash = _compute_document_hash(document)

        # Get stored hash from metadata (if exists)
        stored_hash = document.metadata.get("content_hash") if document.metadata else None

        # Only use cached analysis if hash matches (ensures document hasn't changed)
        if stored_hash and stored_hash == current_hash:
            logger.debug(
                f"Using cached analysis for document {document.id} "
                f"(hash match: {current_hash[:8]}...)"
            )
            return document.analysis
        else:
            if stored_hash:
                logger.info(
                    f"Document {document.id} content changed "
                    f"(hash mismatch: stored {stored_hash[:8]}... vs current {current_hash[:8]}...). "
                    "Re-analyzing document."
                )
            else:
                logger.debug(
                    f"No stored hash found for document {document.id}. "
                    "Re-analyzing to generate fresh analysis."
                )

    # Prepare document content
    # For very long documents, we'd chunk here, but for now we'll optimize tokens
    doc_text = document.text
    max_tokens = 200000  # Approximate token limit (roughly 4 chars per token)

    if len(doc_text) > max_tokens:
        logger.warning(
            f"Document {document.id} is very long ({len(doc_text)} chars). "
            "Consider implementing chunking for better results."
        )
        # Truncate to most relevant sections (keep beginning and end)
        # In production, implement proper chunking with hierarchical summarization
        doc_text = (
            doc_text[: max_tokens // 2]
            + "\n\n[... document truncated ...]\n\n"
            + doc_text[-max_tokens // 2 :]
        )

    prompt = f"""
Document content:
{doc_text}
"""

    temperature = 0.2

    # Select appropriate model based on document complexity
    model_priority = _get_model_priority(document)

    last_exception: Exception | None = None

    for attempt in range(max_retries):
        try:
            logger.debug(
                f"Summarizing document {document.id} (attempt {attempt + 1}/{max_retries}) "
                f"with models: {model_priority}"
            )

            response = await acompletion_with_fallback(
                messages=[
                    {
                        "role": "system",
                        "content": DOCUMENT_SUMMARY_SYSTEM_PROMPT,
                    },
                    {"role": "user", "content": prompt},
                ],
                model_priority=model_priority,
                response_format={"type": "json_object"},
                temperature=temperature,
            )

            summary_data = response.choices[0].message.content
            if not summary_data:
                raise ValueError("Empty response from LLM")

            # Parse and validate response
            try:
                parsed: DocumentAnalysis = DocumentAnalysis.model_validate_json(
                    summary_data, strict=False
                )

                # Ensure all required scores are present, normalize names, and calculate risk_score/verdict
                parsed = _ensure_required_scores(parsed)

                # Store content hash in metadata for future cache validation
                content_hash = _compute_document_hash(document)
                if document.metadata is None:
                    document.metadata = {}
                document.metadata["content_hash"] = content_hash
                document.metadata["analysis_hash_stored_at"] = datetime.now().isoformat()

                logger.info(
                    f"Successfully summarized document {document.id} (hash: {content_hash[:8]}...)"
                )
                return parsed

            except Exception as parse_error:
                logger.warning(f"Failed to parse LLM response: {parse_error}")
                # Fallback: create minimal valid structure
                fallback_scores = {
                    "transparency": DocumentAnalysisScores(
                        score=0, justification="Analysis parsing failed"
                    ),
                    "data_collection_scope": DocumentAnalysisScores(
                        score=0, justification="Analysis parsing failed"
                    ),
                    "user_control": DocumentAnalysisScores(
                        score=0, justification="Analysis parsing failed"
                    ),
                    "third_party_sharing": DocumentAnalysisScores(
                        score=0, justification="Analysis parsing failed"
                    ),
                }
                parsed_fallback: DocumentAnalysis = DocumentAnalysis(
                    summary=summary_data[:500] if summary_data else "Analysis unavailable",
                    scores=fallback_scores,
                    risk_score=5,  # Default middle risk score
                    verdict="caution",  # Default verdict
                    keypoints=[],
                )
                return parsed_fallback

        except Exception as e:
            last_exception = e
            logger.warning(
                f"Attempt {attempt + 1}/{max_retries} failed for document {document.id}: {str(e)}"
            )

            # Exponential backoff: wait before retry (except on last attempt)
            if attempt < max_retries - 1:
                wait_time = 2**attempt  # 1s, 2s, 4s...
                logger.debug(f"Waiting {wait_time}s before retry...")
                await asyncio.sleep(wait_time)
            continue

    # All retries failed
    logger.error(
        f"Failed to summarize document {document.id} after {max_retries} attempts: {last_exception}"
    )
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
Your task is to create a clear and accessible summary of the following document summaries:

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
            temperature=0.2,
            response_format={"type": "json_object"},
            model_priority=["gpt-4o-mini", "gemini-2.5-flash-lite", "mistral-small"],
        )

        logger.debug(response.choices[0].message.content)

        return MetaSummary.model_validate_json(response.choices[0].message.content, strict=False)  # type: ignore
    except Exception as e:
        logger.error(f"Error generating meta-summary: {str(e)}")
        return MetaSummary(
            summary="",
            scores=MetaSummaryScores(
                transparency=MetaSummaryScore(score=0, justification=""),
                data_collection_scope=MetaSummaryScore(score=0, justification=""),
                user_control=MetaSummaryScore(score=0, justification=""),
                third_party_sharing=MetaSummaryScore(score=0, justification=""),
            ),
            risk_score=5,
            verdict="caution",
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
