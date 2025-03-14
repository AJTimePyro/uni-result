from fastapi import FastAPI
from backend.routes import result

app = FastAPI(root_path="/fastapi")

app.include_router(result.router, prefix="/result", tags=["result"])