# Streamlit Threading Warning Fix & Service Architecture

## Problem

When running async operations in separate threads within Streamlit applications, you may encounter warnings like:

```
Thread 'ThreadPoolExecutor-17_0': missing ScriptRunContext! This warning can be ignored when running in bare mode.
```

These warnings occur because Streamlit's context is not available in worker threads, but they don't affect functionality.

## Solution

We've implemented a comprehensive solution that addresses both the warning suppression and proper separation of concerns:

### 1. Service-Based Architecture

Created `src/services/embedding_service.py` to separate business logic from UI code:

```python
class EmbeddingService:
    """Service for handling document embedding operations without UI dependencies."""

    @staticmethod
    def embed_companies(company_slugs: Union[str, List[str]], max_workers: int = 3):
        """Embed documents for one or more companies."""
        # Pure business logic, no UI dependencies
```

### 2. Global Warning Suppression

In `src/dashboard/app.py`, we added global warning suppression:

```python
import warnings
import streamlit as st

# Suppress Streamlit ScriptRunContext warnings globally
warnings.filterwarnings("ignore", message="missing ScriptRunContext")
```

### 3. Context Manager Utility

Created a context manager in `src/dashboard/utils.py` for targeted warning suppression:

```python
@contextmanager
def suppress_streamlit_warnings():
    """Context manager to suppress Streamlit ScriptRunContext warnings in worker threads."""
    warnings.filterwarnings("ignore", message="missing ScriptRunContext")
    try:
        yield
    finally:
        # Restore warnings if needed
        warnings.filterwarnings("default", message="missing ScriptRunContext")
```

### 4. Updated Threading Functions

Modified all threading functions to use the warning suppression:

- `run_embedding_async()` in `src/dashboard/components/embedding.py` - now uses EmbeddingService
- `run_crawl_async()` in `src/dashboard/components/crawling.py`
- `run_async()` in `src/dashboard/utils.py`

## Architecture Benefits

### Separation of Concerns

1. **Business Logic**: `EmbeddingService` handles all embedding operations
2. **UI Logic**: Dashboard components only handle Streamlit UI interactions
3. **Threading**: Proper isolation of async operations in worker threads

### Reusability

The `EmbeddingService` can be used in:

- Streamlit dashboard
- FastAPI endpoints
- CLI tools
- Background jobs
- Any other application context

### Testability

Business logic can be tested independently of UI:

```python
# Test the service directly
from src.services.embedding_service import embedding_service

result = embedding_service.embed_companies("test-company")
assert result is not None
```

## Usage

### For New Threading Operations

When creating new threaded operations, use the context manager:

```python
def run_in_thread():
    with suppress_streamlit_warnings():
        # Your async/threaded code here
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(your_async_function())
        finally:
            loop.close()

with concurrent.futures.ThreadPoolExecutor() as executor:
    future = executor.submit(run_in_thread)
    result = future.result()
```

### For Simple Functions

Use the utility function for simple threaded operations:

```python
from src.dashboard.utils import run_in_thread_with_warning_suppression

result = run_in_thread_with_warning_suppression(your_function, arg1, arg2)
```

### For Embedding Operations

Use the service directly:

```python
from src.services.embedding_service import embedding_service

# Single company
success = embedding_service.embed_companies("company-slug")

# Multiple companies
results = embedding_service.embed_companies(["company-1", "company-2"])
```

## Testing

Run the test scripts to verify functionality:

```bash
cd apps/backend

# Test warning suppression
python test_warning_suppression.py

# Test embedding service
python test_embedding_service.py
```

## Benefits

1. **Cleaner Logs**: No more noisy ScriptRunContext warnings
2. **Better Debugging**: Easier to spot actual issues in logs
3. **Consistent Behavior**: All threaded operations use the same warning suppression approach
4. **Maintainable**: Centralized warning management
5. **Reusable**: Business logic can be used in any context
6. **Testable**: Core functionality can be tested independently
7. **Scalable**: Easy to add new services following the same pattern

## Notes

- These warnings are harmless and don't affect functionality
- The suppression is scoped to worker threads only
- Main thread warnings are still shown for debugging purposes
- The solution is backward compatible with existing code
- The service architecture makes it easy to add new features without UI dependencies
