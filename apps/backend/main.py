from collections.abc import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import settings
from src.core.logging import setup_logging
from src.core.middleware import AuthMiddleware
from src.routes import companies, conversation, list, migration, q
from src.routes import user as user_routes
from src.services.base_service import BaseService

setup_logging()


async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage application lifecycle events."""
    # Startup
    base_service = BaseService()
    await base_service.test_connection()

    yield

    # Shutdown
    base_service.close_connection()


app = FastAPI(title="Toast API", root_path="/toast", lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors.origins,
    allow_methods=settings.cors.methods,
    allow_headers=settings.cors.headers,
    allow_credentials=settings.cors.credentials,
)
app.add_middleware(AuthMiddleware)


@app.get("/health")
async def healthcheck() -> dict[str, str]:
    """Health check endpoint to verify the API is running."""
    return {"status": "healthy", "message": "Toast API is running"}


routes = [
    q.router,
    companies.router,
    conversation.router,
    list.router,
    migration.router,
    user_routes.router,
]

for route in routes:
    app.include_router(route)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
