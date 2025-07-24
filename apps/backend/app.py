from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes import company, crawler, q, list

app = FastAPI(title="Toast API", root_path="/toast")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


routes = [
    crawler.router,
    q.router,
    company.router,
    list.router,
]

for route in routes:
    app.include_router(route)
