from pydantic import BaseModel
from bson import ObjectId

class BaseResultModel(BaseModel):
    id: str

    @classmethod
    def from_mongo(cls, doc):
        """
        Encode id to string
        """

        # Recursively convert all ObjectId fields to strings
        def convert_object_ids(obj):
            if isinstance(obj, dict):
                return {k: convert_object_ids(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_object_ids(i) for i in obj]
            elif isinstance(obj, ObjectId):
                return str(obj)
            return obj

        document = doc.copy()
        document["id"] = str(document.pop("_id"))
        document = convert_object_ids(document)
        return cls(**document)

class University(BaseResultModel):
    id: str
    name: str
    batches: dict[str, str]
    folder_id: str
    short_name: str

class Batch(BaseResultModel):
    id: str
    batch_num: int
    degrees: dict[str, str]
    university_id: str
    folder_id: str

class Degree(BaseResultModel):
    id: str
    degree_id: str
    degree_name: str
    branch_name: str
    colleges: list[dict[str, list[str]]]
    subjects: dict[str, str]
    batch_id: str
    folder_id: str

class College(BaseResultModel):
    id: str
    college_id: str
    college_name: str
    degree_id: str
    folder_id: str

class Subject(BaseResultModel):
    id: str
    subject_name: str
    subject_code: str
    subject_id: str
    subject_credit: int
    max_internal_marks: int
    max_external_marks: int
    passing_marks: int