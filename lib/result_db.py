import pymongo
import re
from lib.env import ENV
from lib.utils import create_short_form_name

def divide_degree_and_branch(degreeName: str):
    """
    It will divide degree name into degree and branch name
    """

    degreeBranchRegex = r'(.+)\s+\((.+)\)'
    degree_name = degreeName
    branch_name = ''

    degreeName = degreeName.strip()
    degree_branch_matched_regex = re.match(degreeBranchRegex, degreeName)
    if degree_branch_matched_regex:
        degree_name = degree_branch_matched_regex.group(1).strip()
        branch_name = degree_branch_matched_regex.group(2).strip()
    
    return degree_name, branch_name

class Result_DB:
    __client : pymongo.MongoClient
    __db: pymongo.database.Database
    __uni_collec: pymongo.collection.Collection
    __batch_collec: pymongo.collection.Collection
    __degree_collec: pymongo.collection.Collection
    __college_along_shift_collec: pymongo.collection.Collection
    __subject_collec: pymongo.collection.Collection

    def __init__(self, university_name: str = ''):
        self.__client = pymongo.MongoClient(ENV.MONGO_STR)
        self.__db = self.__client["uni_result"]

        self.__uni_collec = self.__db["universities"]
        self.__batch_collec = self.__db["batches"]
        self.__degree_collec = self.__db["degrees"]
        self.__college_along_shift_collec = self.__db["colleges"]
        self.__subject_collec = self.__db["subjects"]

        if university_name:
            self.connect_to_university(university_name)
        else:
            raise ValueError("University Name should be provided")
    
    def connect_to_university(self, university_name: str, short_name: str = ''):
        """
        It will find university by name. If not found, it will create one. Note: university_name should be a full name
        """
        
        short_name = short_name or create_short_form_name(university_name)
        self.__uni_document = self.__uni_collec.find_one_and_update({
                "name": university_name
            }, {
                "$setOnInsert": {
                    "name": university_name,
                    "short_name": short_name,
                    "batches": dict()
                }
            }, upsert = True,
            return_document = pymongo.ReturnDocument.AFTER
        )
    
    def __create_new_batch(self, batch_num: int):
        """
        It will create new batch if not already exist and also link with respective university. In the end it will also return batch doc id
        """

        if self.__uni_document["batches"]:
            if batch_num in self.__uni_document["batches"]:
                return self.__uni_document["batches"][batch_num]["_id"]
        
        new_batch = self.__batch_collec.insert_one({
            "batch_num": batch_num,
            "degrees": dict()
        })

        updated_uni_doc = self.__uni_collec.find_one_and_update({
            "_id": self.__uni_document["_id"]
        }, {
            "$push": {
                "batches": {
                    batch_num: new_batch.inserted_id
                }
            }
        }, return_document = pymongo.ReturnDocument.AFTER)
        if updated_uni_doc:
            self.__uni_document = updated_uni_doc
            return new_batch.inserted_id
    
    def __create_new_degree(
        self,
        batch_doc_id: int,
        degree_id: str,
        degree_name: str
    ):
        """
        It will create new degree if not already exist and also link with respective batch. In the end it will also return degree doc id
        """

        batch_doc = self.__batch_collec.find_one({
            "_id": batch_doc_id
        })
        if degree_id in batch_doc["degrees"]:
            return batch_doc["degrees"][degree_id]["_id"]
        
        degree_name, branch_name = divide_degree_and_branch(degree_name)
        new_degree = self.__degree_collec.insert_one({
            "degree_id": degree_id,
            "degree_name": degree_name,
            "branch_name": branch_name,
            "colleges": dict(),
            "subjects": dict()
        })

        self.__batch_collec.update_one({
            "_id": batch_doc_id
        }, {
            "$push": {
                "degrees": {
                    degree_id: new_degree.inserted_id
                }
            }
        })
        return new_degree.inserted_id

    def __create_new_college(
        self,
        degree_doc_id: str,
        college_id: str,
        college_name: str
    ):
        """
        It will create new college if not already exist and also link with respective degree
        """

        degree_doc = self.__degree_collec.find_one({
            "_id": degree_doc_id,
        })
        for shift in ['M', 'E']:
            college_shift_doc_id = next((
                college[shift][1] for college in degree_doc["colleges"]
                    if shift in college and college_id == college[shift][0]
                ), None
            )
            if college_shift_doc_id:
                return college_shift_doc_id
        
        new_college_doc = self.__college_along_shift_collec.insert_one({
            "college_id": college_id,
            "college_name": college_name 
        })

        self.__degree_collec.update_one({
            "_id": degree_doc_id
        }, {
            "$push": {
                "colleges": {
                    degree_id: new_degree.inserted_id
                }
            }
        })
        return new_degree.inserted_id
        

    def __add_subjects_to_degree(
        self,
        degree_doc_id: str,
        subject_ids: list[str]
    ):
        """
        It will add subjects to respected degree
        """

        self.__degree_collec.find_one_and_update({
            "_id": degree_doc_id
        }, {
            "$push": {
                "subjects": {
                    "$each": subject_ids
                }
            }
        })

    def link_all_metadata(
        self,
        subject_ids: list[str],
        degree_id: str,
        degree_name:str,
        batch: int
    ):
        """
        It will link subjects to respective degree, and also make sure to create new batch and degree if they don't exist
        """
        
        batch_doc_id = self.__create_new_batch(batch)
        degree_doc_id = self.__create_new_degree(batch_doc_id, degree_id, degree_id)
        self.__add_subjects_to_degree(degree_doc_id, subject_ids)
    
    def add_subject(
        self,
        subject_name: str,
        subject_code: str,
        subject_id: str,
        subject_credit: int,
        max_internal_marks: int,
        max_external_marks: int,
        passing_marks: int
    ) -> str | None:
        """
        It will create new subject in db and return subject id, and if it is already created then it will just skip
        """

        existing_sub = self.__subject_collect.find_one({
            "subject_id": subject_id,
            "subject_code": subject_code,
            "subject_name": subject_name
        })

        if not existing_sub:
            self.__subject_collect.insert_one({
                "subject_name": subject_name,
                    "subject_code": subject_code,
                    "subject_id": subject_id,
                    "subject_credit": subject_credit,
                    "max_internal_marks": max_internal_marks,
                    "max_external_marks": max_external_marks,
                    "passing_marks": passing_marks
                }
            )
            return subject_id

        else:
            return None
    