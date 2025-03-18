from fastapi import (
    FastAPI,
    APIRouter
)
from backend.routes.batch import router as batch_router
from backend.routes.university import router as university_router
from backend.routes.degree import router as degree_router
from backend.routes.result import router as result_router

app = FastAPI(root_path="/fastapi")
api_router = APIRouter()

# Register all routers here
api_router.include_router(batch_router, prefix="/batch", tags=["batch"])
api_router.include_router(university_router, prefix="/university", tags=["university"])
api_router.include_router(degree_router, prefix="/degree", tags=["degree"])
api_router.include_router(result_router, prefix="/result", tags=["result"])

app.include_router(api_router)