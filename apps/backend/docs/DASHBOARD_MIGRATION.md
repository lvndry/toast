# Dashboard Migration to Independent Package

## Overview

This document outlines the complete migration plan to extract the Streamlit dashboard from the backend as an independent package, including the creation of API key authentication system.

## Phase 1: API Key Authentication System

### 1.1 Create API Key Models

**File**: `src/models/apiKey.py`

```python
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field
from src.user import UserTier

class APIKeyPermission(str, Enum):
    READ_COMPANIES = "read:companies"
    WRITE_COMPANIES = "write:companies"
    READ_DOCUMENTS = "read:documents"
    WRITE_DOCUMENTS = "write:documents"
    READ_ANALYSIS = "read:analysis"
    WRITE_ANALYSIS = "write:analysis"
    ADMIN_ACCESS = "admin:*"

class APIKey(BaseModel):
    id: str
    key_hash: str  # SHA-256 hash of the actual key
    name: str  # Human-readable name for the key
    user_id: str  # Owner of the API key
    permissions: list[APIKeyPermission] = Field(default_factory=list)
    tier: UserTier  # Inherits from user tier
    last_used: datetime | None = None
    expires_at: datetime | None = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    is_active: bool = True
    usage_count: int = 0
    rate_limit_per_minute: int = 60
    ip_whitelist: list[str] = Field(default_factory=list)
```

### 1.2 Create API Key Service

**File**: `src/services/api_key_service.py`

```python
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional
from motor.core import AgnosticCollection
from src.models.apiKey import APIKey, APIKeyPermission
from src.services.base_service import BaseService
from src.user import UserTier
from src.core.logging import get_logger

logger = get_logger(__name__)

class APIKeyService(BaseService):
    def __init__(self):
        super().__init__()
        self._collection: AgnosticCollection = self.db.api_keys

    def _hash_key(self, key: str) -> str:
        """Hash API key for secure storage"""
        return hashlib.sha256(key.encode()).hexdigest()

    def _generate_key(self) -> str:
        """Generate a secure random API key"""
        return f"toast_{secrets.token_urlsafe(32)}"

    async def create_api_key(
        self,
        user_id: str,
        name: str,
        permissions: Optional[list[APIKeyPermission]] = None,
        expires_in_days: Optional[int] = None,
        rate_limit: Optional[int] = None
    ) -> tuple[str, APIKey]:
        """Create new API key, returns (plain_key, api_key_object)"""
        # Get user tier to set default permissions
        user = await self._get_user_tier(user_id)
        user_tier = user.tier if user else UserTier.FREE

        # Set default permissions based on tier
        if permissions is None:
            permissions = self._get_default_permissions(user_tier)

        # Generate key
        plain_key = self._generate_key()
        key_hash = self._hash_key(plain_key)

        # Set expiration
        expires_at = None
        if expires_in_days:
            expires_at = datetime.now() + timedelta(days=expires_in_days)

        # Create API key object
        api_key = APIKey(
            id=secrets.token_urlsafe(16),
            key_hash=key_hash,
            name=name,
            user_id=user_id,
            permissions=permissions,
            tier=user_tier,
            expires_at=expires_at,
            rate_limit_per_minute=rate_limit or self._get_default_rate_limit(user_tier)
        )

        # Save to database
        await self._collection.insert_one(api_key.model_dump())
        logger.info(f"Created API key {api_key.id} for user {user_id}")

        return plain_key, api_key

    async def verify_api_key(self, key: str) -> Optional[APIKey]:
        """Verify API key and return key info"""
        key_hash = self._hash_key(key)

        # Find key in database
        key_doc = await self._collection.find_one({
            "key_hash": key_hash,
            "is_active": True
        })

        if not key_doc:
            return None

        api_key = APIKey(**key_doc)

        # Check expiration
        if api_key.expires_at and api_key.expires_at < datetime.now():
            logger.warning(f"API key {api_key.id} has expired")
            return None

        # Update last used and usage count
        await self._collection.update_one(
            {"id": api_key.id},
            {
                "$set": {"last_used": datetime.now()},
                "$inc": {"usage_count": 1}
            }
        )

        return api_key

    async def revoke_api_key(self, key_id: str, user_id: str) -> bool:
        """Revoke an API key"""
        result = await self._collection.update_one(
            {"id": key_id, "user_id": user_id},
            {"$set": {"is_active": False, "updated_at": datetime.now()}}
        )

        if result.modified_count > 0:
            logger.info(f"Revoked API key {key_id} for user {user_id}")
            return True
        return False

    async def get_user_api_keys(self, user_id: str) -> list[APIKey]:
        """Get all API keys for a user"""
        keys = await self._collection.find({"user_id": user_id}).to_list(length=None)
        return [APIKey(**key) for key in keys]

    def _get_default_permissions(self, tier: UserTier) -> list[APIKeyPermission]:
        """Get default permissions based on user tier"""
        permissions = {
            UserTier.FREE: [
                APIKeyPermission.READ_COMPANIES,
                APIKeyPermission.READ_DOCUMENTS
            ],
            UserTier.BUSINESS: [
                APIKeyPermission.READ_COMPANIES,
                APIKeyPermission.WRITE_COMPANIES,
                APIKeyPermission.READ_DOCUMENTS,
                APIKeyPermission.WRITE_DOCUMENTS,
                APIKeyPermission.READ_ANALYSIS
            ],
            UserTier.ENTERPRISE: [
                APIKeyPermission.READ_COMPANIES,
                APIKeyPermission.WRITE_COMPANIES,
                APIKeyPermission.READ_DOCUMENTS,
                APIKeyPermission.WRITE_DOCUMENTS,
                APIKeyPermission.READ_ANALYSIS,
                APIKeyPermission.WRITE_ANALYSIS,
                APIKeyPermission.ADMIN_ACCESS
            ]
        }
        return permissions.get(tier, permissions[UserTier.FREE])

    def _get_default_rate_limit(self, tier: UserTier) -> int:
        """Get default rate limit based on user tier"""
        limits = {
            UserTier.FREE: 60,      # 60 requests per minute
            UserTier.BUSINESS: 300, # 300 requests per minute
            UserTier.ENTERPRISE: 1000 # 1000 requests per minute
        }
        return limits.get(tier, 60)

    async def _get_user_tier(self, user_id: str) -> Optional[User]:
        """Get user tier for API key creation"""
        from src.services.user_service import user_service
        return await user_service.get_user_by_id(user_id)

# Singleton instance
api_key_service = APIKeyService()
```

### 1.3 Update Authentication Middleware

**File**: `src/core/middleware.py` (update existing)

```python
# Add to existing imports
from src.services.api_key_service import api_key_service
from src.models.apiKey import APIKey

# Update AuthMiddleware class
class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # ... existing code ...

        # Check for authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise HTTPException(status_code=401, detail="Authorization header required")

        # Handle JWT Bearer tokens (existing)
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            user_info = await clerk_auth_service.verify_token(token)
            request.state.auth_type = "jwt"
            request.state.user = user_info
            request.state.user_id = user_info.get("user_id")

        # Handle API Key authentication (new)
        elif auth_header.startswith("ApiKey "):
            api_key = auth_header.split(" ")[1]
            api_key_info = await api_key_service.verify_api_key(api_key)

            if not api_key_info:
                raise HTTPException(status_code=401, detail="Invalid API key")

            request.state.auth_type = "api_key"
            request.state.api_key = api_key_info
            request.state.user_id = api_key_info.user_id
            request.state.permissions = api_key_info.permissions
            request.state.tier = api_key_info.tier

        else:
            raise HTTPException(status_code=401, detail="Invalid authorization header format")

        # ... rest of existing code ...
```

### 1.4 Create API Key Management Routes

**File**: `src/routes/api_keys.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from src.core.jwt import get_current_user, ClerkUser
from src.services.api_key_service import api_key_service
from src.models.apiKey import APIKey, APIKeyPermission
from src.user import UserTier

router = APIRouter(prefix="/api-keys", tags=["api-keys"])

class CreateAPIKeyRequest(BaseModel):
    name: str
    permissions: Optional[list[APIKeyPermission]] = None
    expires_in_days: Optional[int] = None
    rate_limit: Optional[int] = None

class APIKeyResponse(BaseModel):
    id: str
    name: str
    permissions: list[APIKeyPermission]
    tier: UserTier
    last_used: Optional[str]
    expires_at: Optional[str]
    created_at: str
    is_active: bool
    usage_count: int

@router.post("/create")
async def create_api_key(
    req: CreateAPIKeyRequest,
    current_user: ClerkUser = Depends(get_current_user)
) -> dict[str, str]:
    """Create a new API key"""
    plain_key, api_key = await api_key_service.create_api_key(
        user_id=current_user.user_id,
        name=req.name,
        permissions=req.permissions,
        expires_in_days=req.expires_in_days,
        rate_limit=req.rate_limit
    )

    return {
        "api_key": plain_key,  # Only returned once
        "key_id": api_key.id,
        "name": api_key.name,
        "message": "Store this API key securely. It will not be shown again."
    }

@router.get("/list")
async def list_api_keys(
    current_user: ClerkUser = Depends(get_current_user)
) -> list[APIKeyResponse]:
    """List all API keys for the current user"""
    keys = await api_key_service.get_user_api_keys(current_user.user_id)

    return [
        APIKeyResponse(
            id=key.id,
            name=key.name,
            permissions=key.permissions,
            tier=key.tier,
            last_used=key.last_used.isoformat() if key.last_used else None,
            expires_at=key.expires_at.isoformat() if key.expires_at else None,
            created_at=key.created_at.isoformat(),
            is_active=key.is_active,
            usage_count=key.usage_count
        )
        for key in keys
    ]

@router.delete("/{key_id}")
async def revoke_api_key(
    key_id: str,
    current_user: ClerkUser = Depends(get_current_user)
) -> dict[str, str]:
    """Revoke an API key"""
    success = await api_key_service.revoke_api_key(key_id, current_user.user_id)

    if not success:
        raise HTTPException(status_code=404, detail="API key not found")

    return {"message": "API key revoked successfully"}
```

### 1.5 Add Permission Decorator

**File**: `src/core/permissions.py`

```python
from functools import wraps
from fastapi import HTTPException, Request
from src.models.apiKey import APIKeyPermission

def require_permission(permission: APIKeyPermission):
    """Decorator to require specific API key permission"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get request from kwargs (FastAPI dependency injection)
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break

            if not request:
                raise HTTPException(status_code=500, detail="Request not found")

            # Skip permission check for JWT auth
            if getattr(request.state, 'auth_type', None) == 'jwt':
                return await func(*args, **kwargs)

            # Check API key permissions
            if getattr(request.state, 'auth_type', None) == 'api_key':
                permissions = getattr(request.state, 'permissions', [])
                if permission not in permissions and APIKeyPermission.ADMIN_ACCESS not in permissions:
                    raise HTTPException(
                        status_code=403,
                        detail=f"Permission '{permission.value}' required"
                    )
                return await func(*args, **kwargs)

            raise HTTPException(status_code=401, detail="Authentication required")

        return wrapper
    return decorator
```

## Phase 2: Dashboard API Client

### 2.1 Create Toast API Client

**File**: `src/dashboard/toast_api_client.py`

```python
import httpx
from typing import Optional, Any
from src.models.apiKey import APIKey
from src.company import Company
from src.document import Document
from src.core.logging import get_logger

logger = get_logger(__name__)

class ToastAPIClient:
    def __init__(self, api_key: str, base_url: str, timeout: int = 30):
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.headers = {
            "Authorization": f"ApiKey {api_key}",
            "Content-Type": "application/json"
        }

    async def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[dict] = None,
        params: Optional[dict] = None
    ) -> dict[str, Any]:
        """Make HTTP request to Toast API"""
        url = f"{self.base_url}{endpoint}"

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.request(
                    method=method,
                    url=url,
                    headers=self.headers,
                    json=data,
                    params=params
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"API request failed: {e.response.status_code} - {e.response.text}")
                raise
            except httpx.RequestError as e:
                logger.error(f"API request error: {e}")
                raise

    # Company operations
    async def get_companies(self, has_documents: bool = True) -> list[Company]:
        """Get all companies"""
        response = await self._make_request(
            "GET",
            "/toast/companies",
            params={"has_documents": has_documents}
        )
        return [Company(**company) for company in response]

    async def get_company(self, slug: str) -> Company:
        """Get company by slug"""
        response = await self._make_request("GET", f"/toast/companies/{slug}")
        return Company(**response)

    async def create_company(self, company: Company) -> Company:
        """Create a new company"""
        response = await self._make_request(
            "POST",
            "/toast/companies",
            data=company.model_dump()
        )
        return Company(**response)

    async def update_company(self, company: Company) -> Company:
        """Update an existing company"""
        response = await self._make_request(
            "PUT",
            f"/toast/companies/{company.slug}",
            data=company.model_dump()
        )
        return Company(**response)

    async def delete_company(self, company_id: str) -> bool:
        """Delete a company"""
        await self._make_request("DELETE", f"/toast/companies/{company_id}")
        return True

    # Document operations
    async def get_company_documents(self, company_slug: str) -> list[Document]:
        """Get all documents for a company"""
        response = await self._make_request(
            "GET",
            f"/toast/companies/{company_slug}/documents"
        )
        return [Document(**doc) for doc in response]

    async def get_all_documents(self) -> list[Document]:
        """Get all documents"""
        response = await self._make_request("GET", "/toast/documents")
        return [Document(**doc) for doc in response]

    # Analysis operations
    async def generate_embeddings(self, company_slug: str) -> dict[str, Any]:
        """Generate embeddings for a company"""
        response = await self._make_request(
            "POST",
            f"/toast/companies/{company_slug}/embeddings"
        )
        return response

    async def get_rag_answer(self, question: str, company_slug: str) -> str:
        """Get RAG answer for a question"""
        response = await self._make_request(
            "POST",
            f"/toast/companies/{company_slug}/rag",
            data={"question": question}
        )
        return response["answer"]

    async def generate_summary(self, company_slug: str) -> dict[str, Any]:
        """Generate summary for a company"""
        response = await self._make_request(
            "POST",
            f"/toast/companies/{company_slug}/summarize"
        )
        return response

    # Crawling operations
    async def start_crawling(self, company: Company) -> dict[str, Any]:
        """Start crawling for a company"""
        response = await self._make_request(
            "POST",
            f"/toast/companies/{company.slug}/crawl"
        )
        return response
```

### 2.2 Update Dashboard Configuration

**File**: `src/dashboard/config.py`

```python
import os
from pydantic import BaseSettings
from src.user import UserTier

class DashboardConfig(BaseSettings):
    # API Configuration
    toast_api_key: str
    toast_api_url: str = "http://localhost:8000"
    api_timeout: int = 30

    # Dashboard Configuration
    dashboard_title: str = "Toast Dashboard"
    dashboard_icon: str = "🍞"
    page_layout: str = "wide"

    # Feature Flags
    enable_company_creation: bool = True
    enable_crawling: bool = True
    enable_embeddings: bool = True
    enable_summarization: bool = True
    enable_rag: bool = True
    enable_migration: bool = True

    # Rate Limiting
    max_concurrent_requests: int = 5
    request_retry_attempts: int = 3

    class Config:
        env_file = ".env"
        env_prefix = "DASHBOARD_"

# Global configuration instance
dashboard_config = DashboardConfig()
```

## Phase 3: Dashboard Refactoring

### 3.1 Update Dashboard Components

Replace all direct backend imports with API client calls:

**File**: `src/dashboard/components/company_view.py` (example)

```python
import streamlit as st
from src.dashboard.toast_api_client import ToastAPIClient
from src.dashboard.config import dashboard_config
from src.dashboard.utils import run_async

def show_company_view() -> None:
    st.title("Companies")

    # Initialize API client
    api_client = ToastAPIClient(
        api_key=dashboard_config.toast_api_key,
        base_url=dashboard_config.toast_api_url,
        timeout=dashboard_config.api_timeout
    )

    # Get companies via API
    companies = run_async(api_client.get_companies())

    if not companies:
        st.info("No companies found.")
        return

    # Display companies
    for company in companies:
        with st.expander(f"{company.name} ({company.slug})"):
            col1, col2, col3 = st.columns(3)

            with col1:
                st.write(f"**Tier**: {company.tier}")
                st.write(f"**Website**: {company.website}")

            with col2:
                st.write(f"**Documents**: {company.document_count}")
                st.write(f"**Last Updated**: {company.updated_at}")

            with col3:
                if st.button(f"Delete {company.name}", key=f"delete_{company.id}"):
                    if run_async(api_client.delete_company(company.id)):
                        st.success(f"Deleted {company.name}")
                        st.rerun()
                    else:
                        st.error(f"Failed to delete {company.name}")
```

### 3.2 Create Dashboard Package Structure

```
toast-dashboard/
├── pyproject.toml
├── README.md
├── .env.example
├── src/
│   └── toast_dashboard/
│       ├── __init__.py
│       ├── app.py
│       ├── config.py
│       ├── toast_api_client.py
│       ├── models/
│       │   ├── __init__.py
│       │   ├── company.py
│       │   ├── document.py
│       │   └── user.py
│       ├── components/
│       │   ├── __init__.py
│       │   ├── company_creation.py
│       │   ├── company_view.py
│       │   ├── crawling.py
│       │   ├── embedding.py
│       │   ├── migration.py
│       │   ├── rag.py
│       │   └── summarization.py
│       └── utils/
│           ├── __init__.py
│           └── async_utils.py
├── tests/
│   ├── __init__.py
│   ├── test_api_client.py
│   └── test_components.py
└── docker/
    ├── Dockerfile
    └── docker-compose.yml
```

### 3.3 Create Dashboard Package Configuration

**File**: `toast-dashboard/pyproject.toml`

```toml
[project]
name = "toast-dashboard"
version = "0.1.0"
description = "Toast AI Dashboard - Independent Streamlit Application"
readme = "README.md"
requires-python = ">=3.11"

dependencies = [
    "streamlit>=1.43.2",
    "httpx>=0.27.0",
    "pydantic>=2.10.6",
    "python-dotenv>=1.0.1",
    "structlog>=25.4.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.3.5",
    "pytest-asyncio>=1.1.0",
    "ruff>=0.12.10",
    "mypy>=1.15.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.ruff]
target-version = "py311"
line-length = 100

[tool.mypy]
python_version = "3.11"
strict = true
```

## Phase 4: Backend API Endpoints

### 4.1 Create Dashboard-Specific API Endpoints

**File**: `src/routes/dashboard.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from src.core.permissions import require_permission
from src.models.apiKey import APIKeyPermission
from src.services.company_service import company_service
from src.services.document_service import document_service
from src.services.embedding_service import embedding_service
from src.rag import get_answer
from src.summarizer import generate_company_meta_summary

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.post("/companies/{company_slug}/embeddings")
@require_permission(APIKeyPermission.WRITE_DOCUMENTS)
async def generate_embeddings(company_slug: str) -> dict[str, str]:
    """Generate embeddings for a company"""
    try:
        result = await embedding_service.embed_single_company(company_slug)
        return {"status": "success", "message": f"Embeddings generated for {company_slug}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/companies/{company_slug}/rag")
@require_permission(APIKeyPermission.READ_ANALYSIS)
async def get_rag_answer(company_slug: str, question: str) -> dict[str, str]:
    """Get RAG answer for a question"""
    try:
        answer = await get_answer(question, company_slug)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/companies/{company_slug}/summarize")
@require_permission(APIKeyPermission.READ_ANALYSIS)
async def generate_summary(company_slug: str) -> dict[str, Any]:
    """Generate summary for a company"""
    try:
        summary = await generate_company_meta_summary(company_slug)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## Phase 5: Testing & Validation

### 5.1 API Key Service Tests

**File**: `tests/test_api_key_service.py`

```python
import pytest
from datetime import datetime, timedelta
from src.services.api_key_service import api_key_service
from src.models.apiKey import APIKeyPermission
from src.user import UserTier

@pytest.mark.asyncio
async def test_create_api_key():
    """Test API key creation"""
    plain_key, api_key = await api_key_service.create_api_key(
        user_id="test_user",
        name="Test Key"
    )

    assert plain_key.startswith("toast_")
    assert api_key.user_id == "test_user"
    assert api_key.name == "Test Key"
    assert api_key.tier == UserTier.FREE

@pytest.mark.asyncio
async def test_verify_api_key():
    """Test API key verification"""
    plain_key, api_key = await api_key_service.create_api_key(
        user_id="test_user",
        name="Test Key"
    )

    verified_key = await api_key_service.verify_api_key(plain_key)
    assert verified_key is not None
    assert verified_key.id == api_key.id
    assert verified_key.usage_count == 1

@pytest.mark.asyncio
async def test_revoke_api_key():
    """Test API key revocation"""
    plain_key, api_key = await api_key_service.create_api_key(
        user_id="test_user",
        name="Test Key"
    )

    success = await api_key_service.revoke_api_key(api_key.id, "test_user")
    assert success is True

    # Verify key is no longer valid
    verified_key = await api_key_service.verify_api_key(plain_key)
    assert verified_key is None
```

### 5.2 Dashboard API Client Tests

**File**: `tests/test_dashboard_api_client.py`

```python
import pytest
from unittest.mock import AsyncMock, patch
from src.dashboard.toast_api_client import ToastAPIClient

@pytest.mark.asyncio
async def test_get_companies():
    """Test getting companies via API client"""
    with patch('httpx.AsyncClient') as mock_client:
        mock_response = AsyncMock()
        mock_response.json.return_value = [
            {"id": "1", "name": "Test Company", "slug": "test-company"}
        ]
        mock_response.raise_for_status.return_value = None
        mock_client.return_value.__aenter__.return_value.request.return_value = mock_response

        client = ToastAPIClient("test_key", "http://localhost:8000")
        companies = await client.get_companies()

        assert len(companies) == 1
        assert companies[0].name == "Test Company"
```

## Phase 6: Deployment & Documentation

### 6.1 Docker Configuration

**File**: `toast-dashboard/docker/Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY pyproject.toml .
RUN pip install -e .

# Copy application code
COPY src/ src/

# Create non-root user
RUN useradd -m -u 1000 dashboard && chown -R dashboard:dashboard /app
USER dashboard

# Expose port
EXPOSE 8501

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8501/_stcore/health || exit 1

# Run Streamlit
CMD ["streamlit", "run", "src/toast_dashboard/app.py", "--server.port=8501", "--server.address=0.0.0.0"]
```

### 6.2 Environment Configuration

**File**: `toast-dashboard/.env.example`

```bash
# Toast API Configuration
DASHBOARD_TOAST_API_KEY=toast_your_api_key_here
DASHBOARD_TOAST_API_URL=http://localhost:8000
DASHBOARD_API_TIMEOUT=30

# Dashboard Configuration
DASHBOARD_TITLE=Toast Dashboard
DASHBOARD_ICON=🍞
DASHBOARD_PAGE_LAYOUT=wide

# Feature Flags
DASHBOARD_ENABLE_COMPANY_CREATION=true
DASHBOARD_ENABLE_CRAWLING=true
DASHBOARD_ENABLE_EMBEDDINGS=true
DASHBOARD_ENABLE_SUMMARIZATION=true
DASHBOARD_ENABLE_RAG=true
DASHBOARD_ENABLE_MIGRATION=true

# Rate Limiting
DASHBOARD_MAX_CONCURRENT_REQUESTS=5
DASHBOARD_REQUEST_RETRY_ATTEMPTS=3
```

### 6.3 Documentation

**File**: `toast-dashboard/README.md`

````markdown
# Toast Dashboard

Independent Streamlit dashboard for Toast AI legal document analysis platform.

## Features

- Company management and monitoring
- Document analysis and processing
- RAG question answering
- Embedding generation
- Policy summarization
- Real-time crawling status

## Installation

1. Install dependencies:

```bash
pip install -e .
```
````

2. Configure environment:

```bash
cp .env.example .env
# Edit .env with your Toast API credentials
```

3. Run dashboard:

```bash
streamlit run src/toast_dashboard/app.py
```

## API Key Setup

1. Log into Toast AI web application
2. Navigate to API Keys section
3. Create new API key with required permissions
4. Copy key and add to `.env` file

## Docker Deployment

```bash
docker build -t toast-dashboard .
docker run -p 8501:8501 --env-file .env toast-dashboard
```

## Configuration

All configuration is done via environment variables. See `.env.example` for available options.

```

## Implementation Timeline

### Week 1: API Key System
- [ ] Create API key models and service
- [ ] Update authentication middleware
- [ ] Create API key management routes
- [ ] Add permission decorators
- [ ] Write tests for API key system

### Week 2: Dashboard API Client
- [ ] Create ToastAPIClient class
- [ ] Implement all API endpoints
- [ ] Add error handling and retries
- [ ] Write API client tests
- [ ] Create dashboard configuration system

### Week 3: Dashboard Refactoring
- [ ] Update all dashboard components
- [ ] Replace direct backend imports
- [ ] Create independent package structure
- [ ] Add Docker configuration
- [ ] Write integration tests

### Week 4: Testing & Deployment
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Documentation completion
- [ ] Deployment scripts
- [ ] Production validation

## Success Criteria

- [ ] Dashboard runs independently without backend imports
- [ ] All dashboard functionality works via API calls
- [ ] API key authentication is secure and functional
- [ ] Performance is acceptable (<2s response times)
- [ ] Documentation is complete and accurate
- [ ] Docker deployment works in production
- [ ] All tests pass with >90% coverage

## Risk Mitigation

1. **API Performance**: Implement caching and connection pooling
2. **Authentication Security**: Use secure key generation and storage
3. **Error Handling**: Comprehensive error handling and user feedback
4. **Backward Compatibility**: Maintain existing dashboard functionality
5. **Testing**: Extensive testing at all levels (unit, integration, e2e)
```
