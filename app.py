from fastapi import FastAPI

from src.routes import crawler

app = FastAPI(title="Toast API")

routes = [
    crawler.router,
]

for route in routes:
    app.include_router(route)
