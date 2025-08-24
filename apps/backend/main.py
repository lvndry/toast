from core.config import settings
from core.logging import setup_logging
from core.middleware import AuthMiddleware
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes import company, conversation, crawler, list, migration, q
from src.routes import user as user_routes

setup_logging()

app = FastAPI(title="Toast API", root_path="/toast")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors.origins,
    allow_methods=settings.cors.methods,
    allow_headers=settings.cors.headers,
    allow_credentials=settings.cors.credentials,
)
app.add_middleware(AuthMiddleware)


@app.get("/health")
async def healthcheck():
    """Health check endpoint to verify the API is running."""
    return {"status": "healthy", "message": "Toast API is running"}


routes = [
    crawler.router,
    q.router,
    company.router,
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
