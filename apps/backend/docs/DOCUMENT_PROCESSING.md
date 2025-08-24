# Document Processing Workflow

This document describes the new document processing workflow for uploaded documents.

## Overview

When a user uploads a document through the "Upload My Own Documents" feature, the system now follows this workflow:

1. **Document Upload** → User uploads a document (PDF, DOC, DOCX, TXT)
2. **Text Extraction** → Extract text using OCR/parsing (pdfplumber for PDFs, python-docx for DOCX)
3. **Document Classification** → Use LLM (Mistral/Gemini) to classify the document type
4. **Legal Document Validation** → Check if the document is a legal document
5. **Summarization** → If legal, generate summary using existing summarizer
6. **Conversation Creation** → Create a new conversation and navigate to `/c/[conversation_id]`

## Supported File Types

- **PDF**: Uses pdfplumber for text extraction
- **DOCX**: Uses python-docx for text extraction
- **TXT**: Direct text processing
- **DOC**: Basic text extraction (limited support)

## Document Classification

The system classifies documents into these categories:

- `privacy_policy`
- `terms_of_service`
- `cookie_policy`
- `terms_and_conditions`
- `data_processing_agreement`
- `gdpr_policy`
- `copyright_policy`
- `safety_policy`
- `other`

## Legal Document Validation

Only documents classified as legal documents are processed. The system rejects:

- Marketing materials
- Promotional content
- Non-legal documents
- Incomplete or unclear documents

## Error Handling

- **Invalid Document**: Returns 400 error with clear message
- **Processing Error**: Returns 500 error with details
- **OCR Failure**: Logs warning and attempts fallback

## Frontend Integration

The frontend now:

1. Shows appropriate error messages for invalid documents
2. Displays the document classification in success messages
3. Navigates to the conversation page after successful upload
4. Handles loading states during processing

## API Endpoints

### Upload Document

```
POST /api/conversations/{conversation_id}/upload
```

**Request:**

- `file`: Uploaded file
- `company_name`: Company name
- `company_description`: Optional company description

**Response:**

```json
{
  "message": "Document uploaded and processed successfully",
  "document_id": "doc_id",
  "classification": "privacy_policy",
  "analysis_available": true
}
```

**Error Response:**

```json
{
  "detail": "Document is not classified as a legal document. Please upload a legal document such as a privacy policy, terms of service, or similar legal document."
}
```

## Dependencies Added

- `pdfplumber>=0.10.3`: PDF text extraction
- `python-docx>=1.1.0`: DOCX text extraction

## Future Enhancements

- **Cloud OCR**: Integrate with Google Vision API or Azure Computer Vision for image-based PDFs
- **More File Types**: Support for more document formats
- **Batch Processing**: Process multiple documents at once
- **Advanced Classification**: More granular document type classification
