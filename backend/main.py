from fastapi import FastAPI
from backend.routes import api_router

app = FastAPI(root_path="/fastapi")
app.include_router(api_router)