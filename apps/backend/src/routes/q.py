from fastapi import APIRouter
from pydantic import BaseModel

from src.rag import get_answer

router = APIRouter(prefix="/q")


class AskRequest(BaseModel):
    query: str
    company_slug: str


@router.post("")
async def ask(request: AskRequest):
    answer = await get_answer(request.query, request.company_slug)

    return {"answer": answer}
