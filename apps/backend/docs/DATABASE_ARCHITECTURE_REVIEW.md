# Database Architecture Review

## Current Architecture

### Collections Structure

1. **`companies`** - Public companies (e.g., Stripe, Google)

   - `id`, `name`, `slug`, `domains`, `categories`, `crawl_base_urls`, `logo`, `visible_to_tiers`

2. **`documents`** - All documents (both crawled and user-uploaded)

   - `id`, `url`, `title`, `company_id`, `doc_type`, `markdown`, `text`, `metadata`, `analysis`, etc.
   - **Critical Issue**: No `user_id` field

3. **`conversations`** - User-specific conversation threads

   - `id`, `user_id`, `company_name`, `company_slug`, `documents: list[str]` (document IDs)
   - Links to documents via document IDs

4. **`users`** - User accounts
   - `id`, `email`, `tier`, `monthly_usage`, etc.

## Architecture Issues

### 🔴 Critical Issues

#### 1. **Ambiguous `company_id` Semantics**

**Problem**: `company_id` has two different meanings in your codebase:

- **For crawled documents**: Real company ID from `companies` collection
- **For user-uploaded documents**: `conversation.company_slug` (NOT a real company ID)

**Code Evidence**:

**Crawled Documents** (real company ID):

```822:822:apps/backend/src/crawling.py
                company_id=company.id,
```

This sets `company_id` to the actual company's ID from the `companies` collection.

**User-Uploaded Documents** (conversation slug):

```298:298:apps/backend/src/services/conversation_service.py
            company_id=conversation.company_slug,
```

This passes `conversation.company_slug` as the `company_id` parameter, which then gets set:

```101:101:apps/backend/src/document_processor.py
                company_id=company_id,
```

**Impact**:

- Can't reliably join documents → companies (some `company_id` values don't exist in `companies` collection)
- Confusing for developers (is this a real company or a conversation slug?)
- Breaks queries like `get_company_documents()` which queries by `company_id`:

```149:151:apps/backend/src/services/company_service.py
    async def get_company_documents(self, company_id: str) -> list[Document]:
        """Get all documents for a specific company."""
        documents = await self.db.documents.find({"company_id": company_id}).to_list(length=None)
```

This query will return both real company documents AND user-uploaded documents that happen to have a matching slug.

- Can't distinguish public vs private documents at query time

#### 2. **No Document Source Tracking**

**Problem**: Can't distinguish between:

- **Public crawled documents**: Shared across all users, belong to real companies
- **User-uploaded documents**: Private to the conversation, about a company (but not a real company in the system)

**Code Evidence**:

The `Document` model has no `source` field:

```58:72:apps/backend/src/document.py
class Document(BaseModel):
    id: str = Field(default_factory=shortuuid.uuid)
    url: str
    title: str | None = None
    company_id: str
    doc_type: DocType
    markdown: str
    text: str
    metadata: dict[str, Any]
    versions: list[dict[str, Any]] = []
    analysis: DocumentAnalysis | None = None
    locale: str | None = None
    regions: list[Region] = []
    effective_date: datetime | None = None
    created_at: datetime = Field(default_factory=datetime.now)
```

There's also a schema mismatch: `get_company_documents_by_slug()` queries by `company_slug`:

```51:56:apps/backend/src/services/document_service.py
    async def get_company_documents_by_slug(self, company_slug: str) -> list[Document]:
        """Get all documents for a specific company."""
        documents: list[Document] = await self.db.documents.find(
            {"company_slug": company_slug}
        ).to_list(length=None)
        return [Document(**document) for document in documents]
```

But `Document` model has no `company_slug` field - only `company_id`. This query will never return results for crawled documents.

**Impact**:

- Can't implement proper access controls (user-uploaded docs should only be accessible through their conversation)
- Can't show "Public Company Documents" vs "Your Uploaded Documents" in UI
- Can't apply different retention policies (public docs cached forever, user docs deleted after X days)
- Privacy risk: If someone queries all documents, they might see other users' uploaded documents
- Schema mismatch: Queries by `company_slug` won't work for crawled documents

### ⚠️ Moderate Issues

#### 3. **Privacy & Access Control Issues**

**Problem**: User-uploaded documents are stored in the same collection as public documents, but:

- No `conversation_id` field to link document to its conversation
- No `source` field to distinguish public vs private
- Documents are accessed through conversations, but there's no database-level constraint

**Code Evidence**:

Current access pattern requires querying conversations first:

```192:199:apps/backend/src/services/conversation_service.py
    async def get_conversation_documents(self, conversation_id: str) -> list[str]:
        """Get all document IDs for a conversation."""
        try:
            conversation = await self.get_conversation_by_id(conversation_id)
            return conversation.documents if conversation else []
        except Exception as e:
            logger.error(f"Error getting documents for conversation {conversation_id}: {e}")
            return []
```

This returns document IDs, then you need a second query to get the actual documents. There's no direct `conversation_id` field on documents to query them directly.

**Risk**:

- If someone queries documents directly (bypassing conversations), they might see other users' uploaded documents
- No database-level privacy enforcement (can't add `WHERE conversation_id = ?` filter)
- Can't efficiently query "all documents in this conversation" (requires two queries)

#### 4. **Missing Indexes**

**Problem**: No indexes on:

- `conversation_id` (doesn't exist yet - needed for user-uploaded docs)
- `source` (doesn't exist yet)
- `company_id` + `source` (compound query for public company docs)

**Impact**: Slow queries as document collection grows, especially for conversation-based queries

## Recommended Architecture

### Option 1: Enhanced Single Collection (Recommended)

Add fields to existing `documents` collection to distinguish public vs private documents:

```python
class Document(BaseModel):
    id: str
    url: str
    title: str | None = None

    # Source & Privacy
    source: Literal["crawled", "user_uploaded"] = "crawled"
    conversation_id: str | None = None  # For user-uploaded: links to conversation (ensures privacy)

    # Company relationship
    company_id: str | None = None  # Real company ID (from companies collection) - only for crawled docs
    company_slug: str | None = None  # For user-uploaded: the company being analyzed (from conversation)

    # Existing fields
    doc_type: DocType
    markdown: str
    text: str
    metadata: dict[str, Any]
    analysis: DocumentAnalysis | None = None
    # ... rest of fields
```

**Key Design Decisions**:

1. **Documents are always about companies** - but the company might be:

   - A real company (for crawled docs): `company_id` points to `companies` collection
   - A virtual company (for user uploads): `company_slug` is the conversation's company name

2. **Privacy through conversation_id** - User-uploaded documents are private to their conversation:

   - Access control: Only accessible through the conversation
   - Query: `db.documents.find({"conversation_id": conversation_id})`

3. **Clear separation** - `source` field makes it explicit:
   - `source="crawled"` → Public, shared, `company_id` is real
   - `source="user_uploaded"` → Private, `conversation_id` required, `company_slug` is virtual

**Benefits**:

- ✅ Documents always about companies (matches product vision)
- ✅ Clear privacy model (user-uploaded docs linked to conversations)
- ✅ Backward compatible (can migrate existing docs)
- ✅ Efficient queries with indexes
- ✅ No user_id needed (privacy through conversation_id)

**Indexes**:

```python
# Public company documents
db.documents.create_index("company_id")
db.documents.create_index([("company_id", 1), ("source", 1)])

# User-uploaded documents (private)
db.documents.create_index("conversation_id")  # Critical for privacy
db.documents.create_index([("conversation_id", 1), ("source", 1)])

# Source filtering
db.documents.create_index("source")

# Compound for common queries
db.documents.create_index([("source", 1), ("company_id", 1)])  # Public docs by company
```

### Option 2: Separate Collections (If Privacy is Critical)

```python
# Public documents (crawled)
documents_public: {
    company_id: str,  # Always real company ID from companies collection
    source: "crawled"
    # No conversation_id
}

# User-uploaded documents (private)
documents_user: {
    conversation_id: str,  # Required - links to conversation for privacy
    company_slug: str,  # The company being analyzed (from conversation)
    source: "user_uploaded"
    # No company_id (not a real company in the system)
}
```

**Benefits**:

- ✅ Stronger privacy isolation (can't accidentally query across collections)
- ✅ Different schemas for different use cases
- ✅ Easier to apply different retention policies

**Drawbacks**:

- ❌ More complex queries (union across collections when needed)
- ❌ Code duplication
- ❌ Harder to share documents between users later (if that feature is needed)

## Migration Strategy

### Phase 1: Add New Fields (Non-Breaking)

```python
# 1. Add source, conversation_id, and company_slug fields (nullable)
# 2. Backfill existing documents:
#    - source = "crawled"
#    - conversation_id = None
#    - company_slug = None
#    - company_id = existing company_id (keep as-is - these are all real companies)
```

### Phase 2: Update Document Creation

```python
# Crawled documents (public, shared)
document = Document(
    company_id=company.id,  # Real company ID from companies collection
    source="crawled",
    conversation_id=None,  # Not linked to any conversation
    company_slug=None  # Not needed for crawled docs
)

# User-uploaded documents (private to conversation)
document = Document(
    conversation_id=conversation.id,  # Links to conversation for privacy
    company_slug=conversation.company_slug,  # The company being analyzed
    source="user_uploaded",
    company_id=None  # Not a real company in the system
)
```

### Phase 3: Update Queries

```python
# Get public company documents (crawled)
async def get_company_documents(company_id: str) -> list[Document]:
    return await db.documents.find({
        "company_id": company_id,
        "source": "crawled"
    }).to_list()

# Get documents for a conversation (user-uploaded, private)
async def get_conversation_documents(conversation_id: str) -> list[Document]:
    return await db.documents.find({
        "conversation_id": conversation_id,
        "source": "user_uploaded"
    }).to_list()

# Get all documents accessible to a user
async def get_user_accessible_documents(user_id: str) -> list[Document]:
    # Get user's conversations
    conversations = await get_user_conversations(user_id)
    conversation_ids = [c.id for c in conversations]

    # Get user's uploaded documents (through conversations)
    user_docs = await db.documents.find({
        "conversation_id": {"$in": conversation_ids},
        "source": "user_uploaded"
    }).to_list()

    # Get all public documents (crawled)
    public_docs = await db.documents.find({
        "source": "crawled"
    }).to_list()

    return public_docs + user_docs
```

## Alignment with Product Requirements

### From Product Vision:

1. **Company-Centric Model** ✅

   - Documents are always about companies (matches product vision)
   - Users analyze company documents (privacy policies, vendor contracts)
   - Architecture correctly separates public company docs from user-uploaded vendor docs

2. **Privacy by Design** ⚠️

   - Current: User-uploaded documents mixed with public, no clear privacy boundary
   - Need: `conversation_id` ensures user-uploaded docs are only accessible through conversations
   - GDPR: User-uploaded documents should be deletable when user deletes conversation

3. **User Tier System** ✅

   - Current: Users have tiers
   - Need: Track document analysis usage per user (through conversations)
   - Can count: `conversations.count()` or `documents.count({"conversation_id": {"$in": user_conversation_ids}})`

4. **Cost Optimization** ✅

   - Current: Can cache public crawled documents (shared across users)
   - Need: User-uploaded documents analyzed per-user (not cached/shared)
   - `source` field enables different caching strategies

5. **Scalability** ⚠️
   - Current: Inefficient queries
   - Need: Indexed queries for <10s response times

## Recommended Next Steps

1. **Immediate**: Add `user_id` and `source` fields to Document model
2. **Week 1**: Create migration script to backfill existing documents
3. **Week 1**: Add database indexes
4. **Week 2**: Update document creation logic
5. **Week 2**: Update all queries to use new fields
6. **Week 3**: Add user document quota enforcement
7. **Week 3**: Add privacy checks in all document access endpoints

## Query Performance Comparison

### Current (Inefficient):

```python
# Get documents for a conversation
conversation = await db.conversations.find_one({"id": conversation_id})  # Query 1
doc_ids = conversation.documents  # Python
documents = await db.documents.find({"id": {"$in": doc_ids}}).to_list()  # Query 2
```

**Time**: ~50-100ms per conversation

### Recommended (Efficient):

```python
# Get documents for a conversation (direct query)
documents = await db.documents.find({
    "conversation_id": conversation_id,
    "source": "user_uploaded"
}).to_list()
```

**Time**: ~10-20ms (with index on `conversation_id`)

### Public Company Documents (Already Efficient):

```python
# Get public company documents
documents = await db.documents.find({
    "company_id": company_id,
    "source": "crawled"
}).to_list()
```

**Time**: ~10-20ms (with index on `company_id` + `source`)

## Conclusion

**Current architecture correctly models documents as company-centric, but has privacy and clarity issues.**

**Recommendation**: Implement **Option 1** (Enhanced Single Collection) with:

- `source` field: `"crawled"` vs `"user_uploaded"` (required)
- `conversation_id` field: Links user-uploaded docs to conversations for privacy (nullable)
- Clear separation: `company_id` (real companies) vs `company_slug` (virtual companies from conversations)
- Proper indexes: `conversation_id`, `company_id` + `source`, etc.

**Key Insights**:

1. **Documents are always about companies** - Architecture is correct ✅
2. **Privacy through conversations** - User-uploaded docs are private to their conversation ✅
3. **Need source tracking** - Must distinguish public vs private documents ⚠️
4. **Fix ambiguous company_id** - Use `company_id` only for real companies, `company_slug` for user uploads ⚠️

This provides:

- ✅ Maintains company-centric model (matches product vision)
- ✅ Privacy through conversation_id (user-uploaded docs only accessible via conversation)
- ✅ Clear separation of public vs private documents
- ✅ Efficient queries with proper indexes
- ✅ Backward compatible (can migrate existing docs)
- ✅ Room for future features (document sharing between users, teams, etc.)
