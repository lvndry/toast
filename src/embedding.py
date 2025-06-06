import nltk  # type: ignore
import shortuuid
import voyageai  # type: ignore
from dotenv import load_dotenv
from langchain.text_splitter import NLTKTextSplitter
from loguru import logger

from src.db import get_company_documents
from src.pinecone import INDEX_NAME, init_pinecone_index, pc

load_dotenv()

nltk.download("punkt")

voyageai_client = voyageai.Client()

VOYAGE_LAW_2_DIMENSION = 1024
init_pinecone_index(VOYAGE_LAW_2_DIMENSION)


async def embed_company_documents(company_slug: str):
    """
    Process documents by splitting their markdown content and creating embeddings for each chunk.

    Args:
        company_slug: The slug of the company
        documents: List of documents to process
    """
    documents = await get_company_documents(company_slug)
    index = pc.Index(INDEX_NAME)
    splitter = NLTKTextSplitter(chunk_size=800, chunk_overlap=150)
    all_vectors = []

    for doc in documents:
        chunks = splitter.split_text(doc.text)
        logger.debug(f"spliited into {len(chunks)} chunks")

        chunk_embeddings = voyageai_client.embed(
            chunks, model="voyage-law-2", input_type="document"
        )

        logger.info(f"Embedding tokens: {chunk_embeddings.total_tokens}")

        # Create vectors for each chunk
        for chunk, embedding in zip(chunks, chunk_embeddings.embeddings):
            vector = {
                "id": shortuuid.uuid(),
                "values": embedding,
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
