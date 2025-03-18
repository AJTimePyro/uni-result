from fastapi import APIRouter
from backend.models import ResultRequest
from backend.fetch_result_csv import Fetch_Result_CSV

router = APIRouter()

@router.post("/")
async def get_result(result_request: ResultRequest):
    fetch_result_csv = Fetch_Result_CSV(
        result_request.university_name,
        result_request.batch_year,
        result_request.degree_id,
        result_request.semester_num
    )
    await fetch_result_csv.get_college_result(result_request.college_id)
    return {
        "Nothing" : "Lol"
    }