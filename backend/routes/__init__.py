from fastapi import APIRouter
from .result import router as result_router
from .batch import router as batch_router

api_router = APIRouter()

# Register all routers here
api_router.include_router(result_router, prefix="/result", tags=["result"])
api_router.include_router(batch_router, prefix="/batch", tags=["batch"])
