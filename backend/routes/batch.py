from fastapi import APIRouter
from fastapi.encoders import jsonable_encoder
from . import fetch_db

router = APIRouter()

@router.get("/")
async def get_batch():
    batch = await fetch_db.get_batch('')
    return jsonable_encoder({"Batch": batch})