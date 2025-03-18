from fastapi import APIRouter
from backend.models import ResultRequest

router = APIRouter()

@router.post("/")
async def get_result(result_request: ResultRequest):
    return