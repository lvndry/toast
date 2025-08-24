import shortuuid
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
from litellm import embedding

from core.logging import get_logger
from src.document import Document
from src.models import get_model
from src.services.document_service import document_service
from src.vector_db import INDEX_NAME, init_pinecone_index, pc

load_dotenv()
logger = get_logger(__name__)


VOYAGE_LAW_2_DIMENSION = 1024
init_pinecone_index(VOYAGE_LAW_2_DIMENSION)


def _compute_chunk_offsets(full_text: str, chunks: list[str]) -> list[tuple[int, int]]:
    """Compute start/end offsets for each chunk within the full_text by sequential search."""
    offsets: list[tuple[int, int]] = []
    cursor = 0
    for chunk in chunks:
        start = full_text.find(chunk, cursor)
        if start == -1:
            # Fallback: search from beginning if not found after cursor
            start = full_text.find(chunk)
        end = start + len(chunk) if start != -1 else -1
        offsets.append((max(start, 0), max(end, 0)))
        if start != -1:
            cursor = end
    return offsets


async def embed_company_documents(company_slug: str, *, namespace: str | None = None):
    """
    Process documents by splitting their markdown content and creating embeddings for each chunk.

    Args:
        company_slug: The slug of the company
        documents: List of documents to process
    """
    documents = await document_service.get_company_documents(company_slug)
    index = pc.Index(INDEX_NAME)
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200, chunk_overlap=200, separators=["\n\n", "\n", ".", ";", " ", ""]
    )
    all_vectors = []

    for doc in documents:
        chunks = splitter.split_text(doc.text)
        offsets = _compute_chunk_offsets(doc.text, chunks)
        logger.debug(f"spliited into {len(chunks)} chunks")

        model = get_model("voyage-law-2")
        chunk_embeddings = embedding(
            model=model.model,
            input=chunks,
            api_key=model.api_key,
        )

        logger.info(f"Embedding tokens: {chunk_embeddings.usage.total_tokens}")

        # Create vectors for each chunk
        for idx, (chunk, embedding_data) in enumerate(
            zip(chunks, chunk_embeddings.data, strict=False)
        ):
            start, end = offsets[idx] if idx < len(offsets) else (0, 0)
            vector = {
                "id": shortuuid.uuid(),
                "values": embedding_data["embedding"],
                "metadata": {
                    "document_id": doc.id,
                    "title": doc.title,
                    "document_type": doc.doc_type,
                    "url": doc.url,
                    "locale": doc.locale,
                    "chunk_text": chunk,
                    "chunk_start": start,
                    "chunk_end": end,
                    "chunk_index": idx,
                    "effective_date": doc.effective_date.isoformat() if doc.effective_date else "",
                },
            }
            all_vectors.append(vector)

        logger.info(f"Processed {len(chunks)} chunks for document {doc.url}")

    ns = namespace or company_slug
    if all_vectors:
        index.upsert(vectors=all_vectors, namespace=ns)
        logger.info(f"Upserted {len(all_vectors)} vectors to Pinecone")
    else:
        logger.warning("No vectors were created to upsert")


async def embed_document(document: Document, *, namespace: str):
    """Embed a single document into the specified namespace."""
    index = pc.Index(INDEX_NAME)
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200, chunk_overlap=200, separators=["\n\n", "\n", ".", ";", " ", ""]
    )

    chunks = splitter.split_text(document.text)
    offsets = _compute_chunk_offsets(document.text, chunks)

    model = get_model("voyage-law-2")
    chunk_embeddings = embedding(
        model=model.model,
        input=chunks,
        api_key=model.api_key,
    )

    vectors = []
    for idx, (chunk, embedding_data) in enumerate(zip(chunks, chunk_embeddings.data, strict=False)):
        start, end = offsets[idx] if idx < len(offsets) else (0, 0)
        vectors.append(
            {
                "id": shortuuid.uuid(),
                "values": embedding_data["embedding"],
                "metadata": {
                    "document_id": document.id,
                    "title": document.title,
                    "document_type": document.doc_type,
                    "url": document.url,
                    "locale": document.locale,
                    "chunk_text": chunk,
                    "chunk_start": start,
                    "chunk_end": end,
                    "chunk_index": idx,
                    "effective_date": document.effective_date.isoformat()
                    if document.effective_date
                    else "",
                },
            }
        )

    if vectors:
        index.upsert(vectors=vectors, namespace=namespace)
        logger.info(
            f"Upserted {len(vectors)} vectors to Pinecone namespace '{namespace}' for document {document.id}"
        )
    else:
        logger.warning("No vectors created for uploaded document")
