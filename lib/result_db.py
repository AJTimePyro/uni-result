import os
import pymongo
import re
import pandas as pd
from lib.env import ENV
from lib.utils import create_short_form_name
from lib.gdrive import GDrive
from lib.logger import result_db_logger
from lib.db import DB

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

SHIFT_COLLEGE_MAP = {
    'M': 'morning',
    'E': 'evening'
}

class Result_DB(DB):
    __uni_collec: pymongo.collection.Collection
    __batch_collec: pymongo.collection.Collection
    __degree_collec: pymongo.collection.Collection
    __college_collec: pymongo.collection.Collection
    __subject_collec: pymongo.collection.Collection
    __uni_document: dict
    __gdrive: GDrive
    __final_folder_path_tracker: str
    __gdrive_upload_folder_id: str
    __semester_num: int

    def __init__(self, university_name: str = ''):
        super().__init__()

        self.__uni_collec = self._uni_collec
        self.__batch_collec = self._batch_collec
        self.__degree_collec = self._degree_collec
        self.__college_collec = self._college_collec
        self.__subject_collec = self._subject_collec

        self.__gdrive = GDrive()
        self.__final_folder_path_tracker = ''

        if university_name:
            self.connect_to_university(university_name)
        else:
            result_db_logger.error("University Name should be provided")
            raise ValueError("University Name should be provided")
    
    def connect_to_university(self, university_name: str, short_name: str = ''):
        """
        It will find university by name. If not found, it will create one. Note: university_name should be a full name
        """

        result_db_logger.info(f"Connecting to {university_name}...")
        short_name = short_name or create_short_form_name(university_name)
        self.__uni_document = self.__uni_collec.find_one_and_update({
                "name": university_name
            }, {
                "$setOnInsert": {
                    "name": university_name,
                    "short_name": short_name,
                    "batches": dict(),
                    "folder_id": self.__gdrive.create_folder_inside_parent_dir(university_name)
                }
            }, upsert = True,
            return_document = pymongo.ReturnDocument.AFTER
        )
        result_db_logger.info(f"Connected to {university_name} successfully")
        self.__final_folder_path_tracker = university_name
    
    def __create_new_batch(self, batch_num: int):
        """
        It will create new batch if not already exist and also link with respective university. In the end it will also return batch doc id
        """

        batch_doc_id = ''
        batch_num_str = str(batch_num)
        self.__final_folder_path_tracker = self.__uni_document["name"]

        if self.__uni_document["batches"] and batch_num_str in self.__uni_document["batches"]:
            batch_doc_id = self.__uni_document["batches"][batch_num_str]
        else:
            result_db_logger.info(f"Creating new batch {batch_num_str}...")
            new_batch = self.__batch_collec.insert_one({
                "batch_num": batch_num,
                "degrees": dict(),
                "university_id": self.__uni_document["_id"],
                "folder_id": self.__gdrive.create_folder_inside_given_dir(
                    batch_num_str,
                    self.__uni_document["folder_id"],
                    self.__final_folder_path_tracker
                )
            })
            batch_doc_id = new_batch.inserted_id
            result_db_logger.info(f"Batch {batch_num_str} created successfully")

            result_db_logger.info(f"Linking batch with university...")
            updated_uni_doc = self.__uni_collec.find_one_and_update({
                "_id": self.__uni_document["_id"]
            }, {
                "$set": {
                    f"batches.{str(batch_num)}": batch_doc_id
                }
            }, return_document = pymongo.ReturnDocument.AFTER)
            if updated_uni_doc:
                self.__uni_document = updated_uni_doc
                result_db_logger.info(f"Linked batch with university successfully")
            else:
                result_db_logger.error(f"Failed to link batch with university, batch - {batch_num_str}; uni - {self.__uni_document['_id']}")
                raise Exception(f"Failed to link batch with university")

        self.__final_folder_path_tracker = os.path.join(
            self.__final_folder_path_tracker,
            batch_num_str
        )
        return batch_doc_id
    
    def __create_new_degree(
        self,
        batch_doc_id: int,
        degree_id: str,
        degree_name: str
    ):
        """
        It will create new degree if not already exist and also link with respective batch. In the end it will also return degree doc id
        """

        degree_name, branch_name = divide_degree_and_branch(degree_name)
        degree_doc_id = ''

        if branch_name:
            degree_folder_name = f'{degree_id} - {degree_name} ({branch_name})'
        else:
            degree_folder_name = f'{degree_id} - {degree_name}'
        
        batch_doc = self.__batch_collec.find_one({
            "_id": batch_doc_id
        })

        if batch_doc and degree_id in batch_doc["degrees"]:
            degree_doc_id = batch_doc["degrees"][degree_id]
        else:
            result_db_logger.info(f"Creating new degree {degree_id} - {degree_name} {branch_name if branch_name else ''}...")
            new_degree = self.__degree_collec.insert_one({
                "degree_id": degree_id,
                "degree_name": degree_name,
                "branch_name": branch_name,
                "colleges": list(),
                "subjects": dict(),
                "batch_id": batch_doc_id,
                "folder_id": self.__gdrive.create_folder_inside_given_dir(
                    degree_folder_name,
                    batch_doc["folder_id"],
                    self.__final_folder_path_tracker
                )
            })
            degree_doc_id = new_degree.inserted_id
            result_db_logger.info(f"Degree {degree_id} - {degree_name} {branch_name if branch_name else ''} created successfully")

            result_db_logger.info(f"Linking degree with batch...")
            updated_batch = self.__batch_collec.update_one({
                "_id": batch_doc_id
            }, {
                "$set": {
                    f"degrees.{degree_id}": degree_doc_id
                }
            })

            if updated_batch.modified_count > 0:
                result_db_logger.info(f"Linked degree with batch successfully")
            else:
                result_db_logger.error(f"Failed to link degree with batch, {updated_batch}")
                raise Exception(f"Failed to link degree with batch")
            
        self.__final_folder_path_tracker = os.path.join(
            self.__final_folder_path_tracker,
            degree_folder_name
        )
        return degree_doc_id

    def __create_new_college(
        self,
        degree_doc_id: str,
        college_id: str,
        college_name: str,
        is_evening_shift: bool = False
    ) -> str:
        """
        It will create new college if not already exist, also link with respective degree and return college doc id
        """

        college_folder_name = f'{college_id} - {college_name}'
        college_doc_id = ''
        shift = 'M'
        updated_degree = None

        degree_doc = self.__degree_collec.find_one({
            "_id": degree_doc_id,
        })

        if is_evening_shift:
            shift = 'E'            

        # Find the college doc id for the given college id and shift
        college_doc_id = next((
            college[shift][1] for college in degree_doc["colleges"]
                if shift in college and college_id == college[shift][0]
            ), None
        )

        # Getting gdrive folder id, if college already existing for given id and shift
        if college_doc_id:
            college_doc = self.__college_collec.find_one({
                "_id": college_doc_id
            })
            if college_doc:
                self.__gdrive_upload_folder_id = college_doc["folder_id"]
            else:
                college_doc_id = None   
        
        # If not existing then create new college for particular id and shift
        if not college_doc_id:
            existing_clg = self.__college_collec.find_one({
                "college_name": college_name,
                "degree_id": degree_doc_id
            })

            result_db_logger.info(f"Creating new college {college_id} - {college_name}...")
            new_college_details = {
                "college_id": college_id,
                "college_name": college_name,
                "degree_id": degree_doc_id,
                "folder_id": self.__gdrive.create_folder_inside_given_dir(
                    college_folder_name,
                    degree_doc["folder_id"],
                    self.__final_folder_path_tracker
                )
            }
            new_college_doc = self.__college_collec.insert_one(new_college_details)
            college_doc_id = new_college_doc.inserted_id
            self.__gdrive_upload_folder_id = new_college_details["folder_id"]
            result_db_logger.info(f"College {college_id} - {college_name} created successfully")

            result_db_logger.info(f"Linking college({SHIFT_COLLEGE_MAP[shift]} shift) with degree...")
            if existing_clg:
                # Already college with different shift exist, merge new one with existing one in array and link in degree
                updated_degree = self.__degree_collec.update_one({
                    "_id": degree_doc_id,
                    "colleges": {
                        "$elemMatch": {
                            f"{'M' if shift == 'E' else 'M'}.0": existing_clg["college_id"] # Find the element where M[0] or E[0] matches
                        }
                    }}, {
                        "$set": {
                            f"colleges.$.{shift}": [college_id, college_doc_id]  # Directly update the matched element
                        }
                    }
                )
            else:
                # No college with different shift exist, so just push new one in array and link in degree
                updated_degree = self.__degree_collec.update_one({
                    "_id": degree_doc_id
                }, {
                    "$push": {
                        "colleges": {
                            shift: [college_id, college_doc_id]
                        }
                    }
                })

            if updated_degree.modified_count > 0:
                result_db_logger.info(f"Linked college({SHIFT_COLLEGE_MAP[shift]} shift) with degree successfully")
            else:
                result_db_logger.error(f"Failed to link college({SHIFT_COLLEGE_MAP[shift]} shift) with degree, {updated_degree}")
                raise Exception(f"Failed to link college({SHIFT_COLLEGE_MAP[shift]} shift) with degree")
            
        self.__final_folder_path_tracker = os.path.join(
            self.__final_folder_path_tracker,
            college_folder_name
        )
        return college_doc_id

    def __add_subjects_to_degree(
        self,
        degree_doc_id: str,
        subject_ids: list[tuple[str, str]]
    ):
        """
        It will add subjects to respected degree in a single batch update
        """

        # Create a dictionary of all subject updates
        subject_updates = {
            f"subjects.{subject_id}": subject_doc_id 
            for subject_id, subject_doc_id in subject_ids
        }
        
        updated_degree = self.__degree_collec.update_one(
            {
                "_id": degree_doc_id
            }, {
                "$set": subject_updates
            }
        )

        if updated_degree.modified_count > 0:
            result_db_logger.info(f"Subjects added to degree successfully")

    def link_all_metadata(
        self,
        subject_ids: list[tuple[str, str]],
        degree_id: str,
        degree_name:str,
        batch: int,
        college_id: str,
        college_name: str,
        semester_num: int,
        is_evening_shift: bool = False
    ) -> str:
        """
        It will link subjects to respective degree, and also make sure to create new batch and degree if they don't exist, and returns final folder path for uploading the result
        """
        
        batch_doc_id = self.__create_new_batch(batch)
        degree_doc_id = self.__create_new_degree(batch_doc_id, degree_id, degree_name)
        self.__add_subjects_to_degree(degree_doc_id, subject_ids)
        self.__create_new_college(degree_doc_id, college_id, college_name, is_evening_shift)
        self.__semester_num = semester_num
        
    def add_subject(
        self,
        subject_name: str,
        subject_code: str,
        subject_id: str,
        subject_credit: int,
        max_internal_marks: int,
        max_external_marks: int,
        passing_marks: int
    ) -> tuple[str, str] | None:
        """
        It will create new subject in db and return subject id and subject doc id, and if it is already created then it will just skip
        """

        existing_sub = self.__subject_collec.find_one({
            "subject_id": subject_id,
            "subject_code": subject_code,
            "subject_name": subject_name
        })

        if not existing_sub:
            result_db_logger.info(f"Creating new subject {subject_id} - {subject_name}...")
            subject_doc = self.__subject_collec.insert_one({
                "subject_name": subject_name,
                    "subject_code": subject_code,
                    "subject_id": subject_id,
                    "subject_credit": subject_credit,
                    "max_internal_marks": max_internal_marks,
                    "max_external_marks": max_external_marks,
                    "passing_marks": passing_marks
                }
            )
            result_db_logger.info(f"Subject {subject_id} - {subject_name} created successfully")
            return subject_id, subject_doc.inserted_id

        else:
            return None
    
    def store_and_upload_result(
        self,
        student_result_list: list[dict[str, str | list[int]]]
    ):
        """
        It will store and upload result to drive
        """

        # Create filename for this result
        filename = f"{self.__semester_num:02d}.csv"
        file_path = os.path.join(
            ENV.LOCAL_RESULT_FOLDER_PATH,
            self.__final_folder_path_tracker,
            filename
        )

        # Convert results to dataframe and save as CSV
        student_result_df = pd.DataFrame(student_result_list)
        student_result_df.set_index('roll_num', inplace = True)

        # If file doesn't exist, upload it
        if not os.path.exists(file_path):
            result_db_logger.info(f"Storing new result...")
            student_result_df.to_csv(file_path, index = True)
            self.__gdrive.upload_file(file_path, self.__gdrive_upload_folder_id)
            result_db_logger.info(f"Result stored and uploaded successfully")

        # If file exists, update it
        else:
            result_db_logger.info(f"Updating existing result...")

            # Read existing file
            existing_df = pd.read_csv(file_path)
            existing_df.set_index('roll_num', inplace = True)

            # Update existing file with new result
            updated_df = student_result_df.combine_first(existing_df)
            updated_df.fillna('', inplace = True)
            updated_df.to_csv(file_path, index = False)

            # Upload updated file to drive
            self.__gdrive.update_existing_file(self.__gdrive_upload_folder_id, file_path)
            result_db_logger.info(f"Result updated and uploaded successfully")
        
        self.__final_folder_path_tracker = self.__uni_document["name"]
