import os

import nltk  # type: ignore
import shortuuid
from dotenv import load_dotenv
from langchain.text_splitter import NLTKTextSplitter
from loguru import logger
from mistralai import Mistral  # type: ignore
from pinecone import Pinecone, ServerlessSpec  # type: ignore

from src.db import get_company_documents

load_dotenv()


MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
if not MISTRAL_API_KEY:
    raise ValueError("MISTRAL_API_KEY is not set")

client = Mistral(api_key=MISTRAL_API_KEY)

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
if not PINECONE_API_KEY:
    raise ValueError("PINECONE_API_KEY is not set")

pc = Pinecone(api_key=PINECONE_API_KEY)

nltk.download("punkt")

INDEX_NAME = "toast-pinecone"

if not pc.has_index(INDEX_NAME):
    pc.create_index(
        name=INDEX_NAME,
        dimension=1024,  # dimension on mistal-embed model
        vector_type="dense",
        metric="dotproduct",
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )


async def embed_company_documents(company_slug: str):
    """
    Process documents by splitting their markdown content and creating embeddings for each chunk.

    Args:
        company_slug: The slug of the company
        documents: List of documents to process
    """
    documents = await get_company_documents(company_slug)
    index = pc.Index(INDEX_NAME)
    splitter = NLTKTextSplitter(chunk_size=1500, chunk_overlap=100)
    all_vectors = []

    for doc in documents:
        chunks = splitter.split_text(doc.text)

        chunk_embeddings = client.embeddings.create(
            model="mistral-embed",
            inputs=chunks,
        )

        # Create vectors for each chunk
        for chunk, embedding in zip(chunks, chunk_embeddings.data):
            vector = {
                "id": shortuuid.uuid(),
                "values": embedding.embedding,
                "metadata": {
                    "company_slug": company_slug,
                    "document_type": doc.doc_type,
                    "url": doc.url,
                    "created_at": doc.created_at.isoformat(),
                    "locale": doc.locale,
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


async def search_query(query: str, company_slug: str, top_k: int = 3):
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
