from fastapi import (
    FastAPI,
    APIRouter
)
from backend.routes.result import router as result_router
from backend.routes.batch import router as batch_router

app = FastAPI(root_path="/fastapi")
api_router = APIRouter()

# Register all routers here
api_router.include_router(result_router, prefix="/result", tags=["result"])
api_router.include_router(batch_router, prefix="/batch", tags=["batch"])

app.include_router(api_router)