from core.jwt import get_optional_user
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from src.services.qa_service import ask as qa_ask

router = APIRouter(prefix="/q")


class AskRequest(BaseModel):
    query: str
    company_slug: str
    namespace: str | None = None


@router.post("")
async def ask(request: AskRequest, user=Depends(get_optional_user)):
    namespace = request.namespace
    answer = await qa_ask(request.query, request.company_slug, namespace=namespace)

    return {"answer": answer}
