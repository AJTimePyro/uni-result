from fastapi import APIRouter, HTTPException
from . import fetch_db
from lib.customErrors import DocumentNotFound
from bson.errors import InvalidId

router = APIRouter()

@router.get("/")
async def get_degree(id: str):
    try:
        degree = await fetch_db.get_degree(id)
        if degree:
            return degree
    except DocumentNotFound as err:
        raise HTTPException(
            status_code = 404,
            detail = err.message
        )
    except InvalidId as err:
        raise HTTPException(
            status_code = 400,
            detail = "Invalid degree id"
        )
    except Exception as err:
        print(err)
        raise HTTPException(
            status_code = 500,
            detail = "Something went wrong"
        )