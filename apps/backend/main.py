from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes import company, conversation, crawler, list, migration, q

app = FastAPI(title="Toast API", root_path="/toast")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
]

for route in routes:
    app.include_router(route)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
