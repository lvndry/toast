from core.jwt import get_optional_user
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from src.rag import get_answer

router = APIRouter(prefix="/q")


class AskRequest(BaseModel):
    query: str
    company_slug: str
    namespace: str | None = None


@router.post("")
async def ask(request: AskRequest, user=Depends(get_optional_user)):
    # Support custom namespace if provided (e.g., conversation.id), else default to company_slug
    namespace = request.namespace
    answer = await get_answer(request.query, request.company_slug, namespace=namespace)

    return {"answer": answer}
