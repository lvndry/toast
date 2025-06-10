import shortuuid
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
from litellm import embedding
from loguru import logger

from src.db import get_company_documents
from src.models import get_model
from src.pinecone import INDEX_NAME, init_pinecone_index, pc

load_dotenv()


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
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200, chunk_overlap=200, separators=["\n\n", "\n", ".", ";", " ", ""]
    )
    all_vectors = []

    for doc in documents:
        chunks = splitter.split_text(doc.text)
        logger.debug(f"spliited into {len(chunks)} chunks")

        model = get_model("voyage-law-2")
        chunk_embeddings = embedding(
            model=model.model,
            input=chunks,
            api_key=model.api_key,
        )

        logger.info(f"Embedding tokens: {chunk_embeddings.usage.total_tokens}")

        # Create vectors for each chunk
        for chunk, embedding_data in zip(chunks, chunk_embeddings.data):
            vector = {
                "id": shortuuid.uuid(),
                "values": embedding_data["embedding"],
                "metadata": {
                    "document_id": doc.id,
                    "title": doc.title,
                    "document_type": doc.doc_type,
                    "url": doc.url,
                    "locale": doc.locale,
                    "chunk_text": chunk,  # Store the actual chunk text for reference
                    "effective_date": doc.effective_date.isoformat()
                    if doc.effective_date
                    else "",
                },
            }
            all_vectors.append(vector)

        logger.info(f"Processed {len(chunks)} chunks for document {doc.url}")

    if all_vectors:
        index.upsert(vectors=all_vectors, namespace=company_slug)
        logger.info(f"Upserted {len(all_vectors)} vectors to Pinecone")
    else:
        logger.warning("No vectors were created to upsert")
