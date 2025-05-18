from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routes import crawler

app = FastAPI(title="Toast API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


routes = [
    crawler.router,
]

for route in routes:
    app.include_router(route)
