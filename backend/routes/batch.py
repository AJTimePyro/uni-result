from fastapi import APIRouter, HTTPException
from . import fetch_db
from lib.customErrors import DocumentNotFound
from bson.errors import InvalidId

router = APIRouter()

@router.get("/")
async def get_batch(id: str):
    try:
        batch = await fetch_db.get_batch(id)
        if batch:
            return batch
    except DocumentNotFound as err:
        raise HTTPException(
            status_code = 404,
            detail = err.message
        )
    except InvalidId as err:
        raise HTTPException(
            status_code = 400,
            detail = "Invalid batch id"
        )
    except Exception as err:
        raise HTTPException(
            status_code = 500,
            detail = "Something went wrong"
        )
    