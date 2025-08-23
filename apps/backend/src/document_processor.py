"""Document processing service for uploaded documents with OCR, classification, and summarization."""

import json
from typing import Dict, Any, Optional
from loguru import logger

from dotenv import load_dotenv
from litellm import acompletion
from pydantic import BaseModel
import pdfplumber
from docx import Document as DocxDocument
from io import BytesIO

from src.document import Document, DocumentAnalysis
from src.models import get_model, SupportedModel
from src.summarizer import summarize_document

load_dotenv()


class DocumentProcessingResult(BaseModel):
    """Result of document processing."""

    success: bool
    is_legal_document: bool
    document: Optional[Document] = None
    analysis: Optional[DocumentAnalysis] = None
    error_message: Optional[str] = None


class DocumentProcessor:
    """Process uploaded documents with OCR, classification, and summarization."""

    def __init__(
        self,
        model: SupportedModel = "mistral-small",
        temperature: float = 0.1,
        max_content_length: int = 5000,
    ):
        """Initialize the document processor."""
        model_config = get_model(model)
        self.model = model_config.model
        self.api_key = model_config.api_key
        self.temperature = temperature
        self.max_content_length = max_content_length

        # Document type categories for classification
        self.categories = [
            "privacy_policy",
            "terms_of_service",
            "cookie_policy",
            "terms_and_conditions",
            "data_processing_agreement",
            "gdpr_policy",
            "copyright_policy",
            "safety_policy",
            "other",
        ]

    async def process_document(
        self, file_content: bytes, filename: str, content_type: str, company_id: str
    ) -> DocumentProcessingResult:
        """
        Process an uploaded document through the complete pipeline.

        Args:
            file_content: Raw file content
            filename: Original filename
            content_type: MIME type of the file
            company_id: ID of the company/conversation

        Returns:
            DocumentProcessingResult with processing results
        """
        try:
            # Step 1: Extract text from document (OCR for PDFs, direct text for others)
            text_content = await self._extract_text(
                file_content, filename, content_type
            )
            if not text_content:
                return DocumentProcessingResult(
                    success=False,
                    is_legal_document=False,
                    error_message="Failed to extract text from document",
                )

            # Step 2: Classify the document
            classification = await self._classify_document(text_content, filename)

            # Step 3: Check if it's a legal document
            if not classification.get("is_legal_document", False):
                return DocumentProcessingResult(
                    success=False,
                    is_legal_document=False,
                    error_message="Document is not classified as a legal document",
                )

            # Step 4: Create document object
            document = Document(
                url=f"uploaded://{filename}",
                title=filename,
                company_id=company_id,
                doc_type=classification.get("classification", "other"),
                markdown=text_content,
                text=text_content,
                metadata={
                    "filename": filename,
                    "content_type": content_type,
                    "size": len(file_content),
                    "classification": classification,
                },
            )

            # Step 5: Generate summary using existing summarizer
            analysis = await summarize_document(document)
            if analysis:
                document.analysis = analysis

            return DocumentProcessingResult(
                success=True,
                is_legal_document=True,
                document=document,
                analysis=analysis,
            )

        except Exception as e:
            logger.error(f"Error processing document {filename}: {str(e)}")
            return DocumentProcessingResult(
                success=False,
                is_legal_document=False,
                error_message=f"Processing error: {str(e)}",
            )

    async def _extract_text(
        self, file_content: bytes, filename: str, content_type: str
    ) -> Optional[str]:
        """Extract text from uploaded document."""
        try:
            # Handle different file types
            if content_type == "application/pdf":
                return await self._extract_text_from_pdf(file_content)
            elif content_type in ["text/plain", "text/markdown"]:
                return file_content.decode("utf-8", errors="ignore")
            elif content_type in [
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ]:
                return await self._extract_text_from_docx(file_content)
            else:
                # Try to decode as text for unknown types
                return file_content.decode("utf-8", errors="ignore")
        except Exception as e:
            logger.error(f"Error extracting text from {filename}: {str(e)}")
            return None

    async def _extract_text_from_pdf(self, file_content: bytes) -> Optional[str]:
        """Extract text from PDF using pdfplumber."""
        try:
            # Use pdfplumber to extract text from PDF
            with BytesIO(file_content) as pdf_file:
                with pdfplumber.open(pdf_file) as pdf:
                    text_parts = []
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text_parts.append(page_text)

                    if text_parts:
                        return "\n".join(text_parts)
                    else:
                        # If no text extracted, the PDF might be image-based
                        # In production, you'd want to add OCR here
                        logger.warning("No text extracted from PDF - may need OCR")
                        return None

        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            return None

    async def _extract_text_from_docx(self, file_content: bytes) -> Optional[str]:
        """Extract text from DOCX file using python-docx."""
        try:
            # Use python-docx to extract text from DOCX
            with BytesIO(file_content) as docx_file:
                doc = DocxDocument(docx_file)
                text_parts = []
                for paragraph in doc.paragraphs:
                    if paragraph.text.strip():
                        text_parts.append(paragraph.text)

                if text_parts:
                    return "\n".join(text_parts)
                else:
                    return None
        except Exception as e:
            logger.error(f"Error extracting text from DOCX: {str(e)}")
            return None

    async def _classify_document(
        self, text_content: str, filename: str
    ) -> Dict[str, Any]:
        """Classify the document using LLM."""
        # Truncate content if too long
        if len(text_content) > self.max_content_length:
            text_content = text_content[: self.max_content_length]

        prompt = f"""Analyze this document and classify it as a legal document.

Document filename: {filename}
Document content:
{text_content}

Please return a JSON object with the following fields:

- classification: the most appropriate category from this list: {self.categories}
- classification_justification: a brief explanation of why this category was selected
- is_legal_document: a boolean. This should be True only if the document contains substantive legal text (e.g., terms of service, privacy policy, data protection policy, etc.)
- is_legal_document_justification: a short rationale for your legal classification decision

Use caution: If the content appears incomplete, vague, or primarily promotional, treat it with skepticism and prefer "other" unless clear evidence suggests a more specific classification."""

        system_prompt = """You are a legal document classifier. Identify substantive legal content and categorize accurately."""

        try:
            response = await acompletion(
                model=self.model,
                api_key=self.api_key,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                temperature=self.temperature,
            )

            result = json.loads(response.choices[0].message.content)
            logger.debug(f"Document classification result: {result}")
            return result

        except Exception as e:
            logger.warning(f"Document classification failed: {e}")
            return {
                "classification": "other",
                "classification_justification": f"Classification failed: {e}",
                "is_legal_document": False,
                "is_legal_document_justification": "Could not analyze due to error",
            }
