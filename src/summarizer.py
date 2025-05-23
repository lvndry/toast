import os

from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec

from src.document import DocumentService

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
if not PINECONE_API_KEY:
    raise ValueError("PINECONE_API_KEY is not set")


document_service = DocumentService()
pc = Pinecone(api_key=PINECONE_API_KEY)

INDEX_NAME = "toast-pinecone"

if not pc.has_index(INDEX_NAME):
    pc.create_index(
        name=INDEX_NAME,
        dimension=2,  # Replace with your model dimensions
        metric="cosine",  # Replace with your model metric
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )
