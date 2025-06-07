# Toast API

## Prerequisites

- [uv]()


## Workflow step

### 1. Crawling

1. Fetch list of companies
2. For each companies we have a list of base crawl URLs. We start crawling from there
3. For each page we extract the content and metadata
4. We evaluate if the page is a legal page or not
5. We evaluate the language of the page
6. We store it in database

### 2. Embedding & Storage in vector database

1. Get all companies
2. For each get all their documents
3. For each document split in chunk using nltksplitter
4. For each chunk embed using mistral embed
5. Store the embeddings in pinecone
