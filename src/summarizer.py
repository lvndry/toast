import asyncio
import os

from dotenv import load_dotenv
from litellm import completion
from loguru import logger

from src.db import get_all_documents, update_document
from src.document import Document, DocumentAnalysis

load_dotenv()


async def summarize_company_documents(company_slug: str) -> str:
    documents = await get_all_documents()
    logger.info(f"Summarizing {len(documents)} documents for {company_slug}")
    for doc in documents:
        analysis = await summarize_document(doc)
        doc.analysis = analysis
        logger.debug(f"Analysis: {analysis}")
        await update_document(doc)

    logger.info(f"Summarized {len(documents)} documents for {company_slug}")


async def summarize_document(document: Document) -> DocumentAnalysis:
    prompt = f"""You are a privacy-focused document summarizer. Your task is to read and analyze this legal document and produce a comprehensive yet easy-to-understand summary, specifically for readers who care about how their data is handled.

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
Always refer to the organization by name or as “the company.” Never use "they" or "their" to avoid ambiguity.

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
You are a privacy-focused document summarizer that makes legal documents accessible to non-legal audiences. Always refer to the company directly by name or as 'the company' - never use 'they' or 'their'.
"""

    try:
        response = completion(
            model="mistral/mistral-small-latest",
            api_key=os.getenv("MISTRAL_API_KEY"),
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


if __name__ == "__main__":
    asyncio.run(summarize_company_documents("youtube"))
