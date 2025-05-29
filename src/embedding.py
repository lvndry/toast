import os
import re

import shortuuid
from dotenv import load_dotenv
from langchain.text_splitter import NLTKTextSplitter
from loguru import logger
from pinecone import Pinecone  # type: ignore

from src.document import Document

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
if not PINECONE_API_KEY:
    raise ValueError("PINECONE_API_KEY is not set")

pc = Pinecone(api_key=PINECONE_API_KEY)

INDEX_NAME = "toast-pinecone"

if not pc.has_index(INDEX_NAME):
    pc.create_index_for_model(
        name=INDEX_NAME,
        cloud="aws",
        region="us-east-1",
        embed={"model": "llama-text-embed-v2", "field_map": {"text": "markdown"}},
    )


def clean_markdown(md: str) -> str:
    md = re.sub(r"`{3}[\s\S]*?`{3}", "", md)  # code blocks
    md = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", md)  # links
    md = re.sub(r"\|.*\|", "", md)  # tables
    return md


async def embed_documents(company_slug: str, documents: list[Document]):
    """
    Process documents by splitting their markdown content and creating embeddings for each chunk.

    Args:
        company_slug: The slug of the company
        documents: List of documents to process
    """
    # Create splitter
    splitter = NLTKTextSplitter(chunk_size=1500, chunk_overlap=100)
    index = pc.Index(INDEX_NAME)
    all_vectors = []

    for doc in documents:
        # Clean and split the markdown content
        cleaned_markdown = clean_markdown(doc.markdown)
        chunks = splitter.split_text(cleaned_markdown)

        # Create embeddings for all chunks of this document
        chunk_embeddings = pc.inference.embed(
            model="llama-text-embed-v2",
            inputs=chunks,
            parameters={"input_type": "passage"},
        )

        # Create vectors for each chunk
        for chunk, embedding in zip(chunks, chunk_embeddings):
            vector = {
                "id": shortuuid.uuid(),
                "values": embedding.values,
                "metadata": {
                    "company_slug": company_slug,
                    "document_type": doc.doc_type,
                    "url": doc.url,
                    "created_at": doc.created_at.isoformat(),
                    "chunk_text": chunk,  # Store the actual chunk text for reference
                },
            }
            all_vectors.append(vector)

        logger.info(f"Processed {len(chunks)} chunks for document {doc.url}")

    if all_vectors:
        index.upsert(vectors=all_vectors, namespace=company_slug)
        logger.info(f"Upserted {len(all_vectors)} vectors to Pinecone")
    else:
        logger.warning("No vectors were created to upsert")


async def search_query(query: str, company_slug: str, top_k: int = 1):
    index = pc.Index(INDEX_NAME)
    search_results = index.search(
        namespace=company_slug,
        query={
            "inputs": {
                "text": query,
            },
            "top_k": top_k,
        },
    )
    return search_results
