from fastapi import FastAPI

app = FastAPI(title="Toast API")

routes = []

for route in routes:
    app.include_router(route)
