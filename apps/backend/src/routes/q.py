from fastapi import APIRouter, Depends
from pydantic import BaseModel

from src.core.jwt import get_optional_user
from src.services.qa_service import ask as qa_ask
from src.user import User

router = APIRouter(prefix="/q")


class AskRequest(BaseModel):
    query: str
    company_slug: str
    namespace: str | None = None


@router.post("")
async def ask(
    request: AskRequest, user: User | None = Depends(get_optional_user)
) -> dict[str, str]:
    namespace = request.namespace
    answer = await qa_ask(request.query, request.company_slug, namespace=namespace)

    return {"answer": answer}
