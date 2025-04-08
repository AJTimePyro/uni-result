from fastapi import APIRouter
from . import fetch_db

router = APIRouter()

@router.get("/")
async def get_university(id: str | None = None, name: str | None = None):
    try:
        if id:
            university = await fetch_db.get_university(id)
        elif name:
            university = await fetch_db.get_university_by_name(name)
        else:
            raise HTTPException(
                status_code = 400,
                detail="Either 'id' or 'name' is required"
                )
        if university:
            return university
        
    except DocumentNotFound as err:
        raise HTTPException(
            status_code = 404,
            detail = err.message
        )
    except InvalidId as err:
        raise HTTPException(
            status_code = 400,
            detail = "Invalid university id"
        )
    except Exception as err:
        raise HTTPException(
            status_code = 500,
            detail = "Something went wrong"
        )

@router.get("/all")
async def get_all_universities():
    universities = await fetch_db.get_all_universities()
    return universities