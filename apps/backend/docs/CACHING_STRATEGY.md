# Meta-Summary Caching Strategy

## Problem Analysis

### Current Flow

1. User visits `/c/[slug]` page
2. Frontend calls `/api/meta-summary/${slug}`
3. Backend calls `generate_company_meta_summary(company_slug)`
4. Function:
   - Fetches all documents for company
   - For each document without analysis, calls `summarize_document()` (LLM call)
   - Generates meta-summary from all document summaries (LLM call)
5. Returns meta-summary

### Performance Issues

- **Meta-summary regenerated every request**: Even if documents haven't changed, meta-summary is regenerated
- **Unnecessary LLM calls**: Meta-summary generation makes LLM call even when all documents are already analyzed
- **No cache invalidation**: No mechanism to detect when documents change and invalidate cache
- **Slow page loads**: Every page visit triggers expensive LLM operations

## Solution Architecture

### Multi-Layer Caching Strategy

1. **Database Cache Layer** (Primary)

   - Store meta-summary in `meta_summaries` collection
   - Store "document signature" (hash of all document content hashes)
   - Check signature on request - if unchanged, return cached meta-summary

2. **Document-Level Caching** (Already exists)

   - Each document stores `content_hash` in metadata
   - `summarize_document()` checks hash before regenerating analysis
   - This prevents re-analyzing unchanged documents

3. **Cache Invalidation Strategy**
   - When document is updated/added/deleted, invalidate company meta-summary
   - Document signature changes trigger meta-summary regeneration
   - Manual cache invalidation endpoint for admin use

### Implementation Plan

#### Phase 1: Database Cache Layer

- [x] `meta_summaries` collection exists
- [x] `get_company_meta_summary()` and `store_company_meta_summary()` methods exist
- [ ] Add document signature tracking
- [ ] Update `generate_company_meta_summary()` to check cache first

#### Phase 2: Cache Invalidation

- [ ] Compute document signature from all document hashes
- [ ] Compare signature on cache lookup
- [ ] Invalidate cache when documents change

#### Phase 3: Optimization

- [ ] Batch document analysis checks
- [ ] Parallel document analysis when needed
- [ ] Add Redis layer for even faster lookups (future)

## Cache Key Structure

```python
{
    "company_id": str,
    "company_slug": str,
    "meta_summary": MetaSummary,
    "document_signature": str,  # SHA256 hash of sorted document hashes
    "created_at": datetime,
    "updated_at": datetime
}
```

## Document Signature Calculation

```python
def compute_document_signature(documents: list[Document]) -> str:
    """Compute signature from all document content hashes."""
    # Get all document hashes (sorted for consistency)
    hashes = sorted([
        doc.metadata.get("content_hash", "")
        for doc in documents
        if doc.metadata
    ])
    # Combine and hash
    combined = "|".join(hashes)
    return hashlib.sha256(combined.encode()).hexdigest()
```

## Cache Invalidation Triggers

1. **Document Updated**: When `document_service.update_document()` is called
2. **Document Added**: When `document_service.store_document()` is called
3. **Document Deleted**: When `document_service.delete_document()` is called
4. **Manual Invalidation**: Admin endpoint to force regeneration

## Performance Improvements

### Before

- Every page load: ~5-30 seconds (depending on document count)
- LLM calls: 1 per document + 1 for meta-summary
- Database queries: Multiple

### After

- Cached page load: <100ms (database lookup only)
- LLM calls: 0 (when cached)
- Database queries: 1-2 (cache lookup + company lookup)

### Cache Hit Rate Expected

- First visit: 0% (cache miss, generates summary)
- Subsequent visits: 95%+ (cache hit, instant response)
- After document update: Cache invalidated, regenerates once

## Future Enhancements

1. **Redis Layer**: Add Redis caching for sub-10ms lookups
2. **Background Regeneration**: Regenerate cache asynchronously when invalidated
3. **Partial Updates**: Only regenerate meta-summary for changed documents
4. **TTL**: Add time-based expiration for extra safety
