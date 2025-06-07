from fastapi import APIRouter

router = APIRouter(prefix="/crawler")


@router.get("/crawl")
async def crawl():
    return {"documents": []}
