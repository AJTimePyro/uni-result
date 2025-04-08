from fastapi import APIRouter
from backend.models import ResultRequest
from backend.fetch_result_csv import Fetch_Result_CSV

router = APIRouter()

@router.post("/")
async def get_result(result_request: ResultRequest):
    fetch_result_csv = Fetch_Result_CSV(
        result_request.college_id,
        result_request.degree_doc_id,
        result_request.semester_num,
        result_request.result_file_id
    )
    final_result_json, subject_data_list = await fetch_result_csv.get_college_result()
    return {
        "result" : final_result_json,
        "subjects" : subject_data_list
    }