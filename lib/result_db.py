import os
import pymongo
import pymongo.database
import pymongo.collection
from pymongo import WriteConcern
from pymongo.read_concern import ReadConcern
from pymongo.read_preferences import ReadPreference
from pymongo.client_session import TransactionOptions
import re
import pandas as pd
import numpy as np
from lib.env import ENV
from lib.utils import create_short_form_name
from lib.gdrive import GDrive
from lib.logger import result_db_logger
from lib.db import DB
from ast import literal_eval

# GGSIPU grade rating
GRADE_RATING_GGSIPU = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'P': 4,
    'F': 0
}

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

txn_options = TransactionOptions(
    read_concern = ReadConcern("snapshot"),
    write_concern = WriteConcern("majority"),
    read_preference = ReadPreference.PRIMARY,
    max_commit_time_ms = 120000  # 120 seconds
)

class Result_DB(DB):
    __uni_collec: pymongo.collection.Collection
    __batch_collec: pymongo.collection.Collection
    __degree_collec: pymongo.collection.Collection
    # __college_collec: pymongo.collection.Collection
    __subject_collec: pymongo.collection.Collection
    __hall_of_fame_collec: pymongo.collection.Collection
    __uni_document: dict
    __gdrive: GDrive
    __final_folder_path_tracker: str
    __gdrive_upload_folder_id: str
    __semester_num: int
    __college_id: str
    __subject_credits_dict: dict[str, int]
    __degree_doc_id: str
    __gdrive_file_id: str | None

    def __init__(self, university_name: str = ''):
        super().__init__()

        self.__uni_collec = self._uni_collec
        self.__batch_collec = self._batch_collec
        self.__degree_collec = self._degree_collec
        # self.__college_collec = self._college_collec
        self.__subject_collec = self._subject_collec
        self.__hall_of_fame_collec = self._hall_of_fame_collec

        self.__gdrive = GDrive()
        self.__final_folder_path_tracker = ''
        self.__subject_credits_dict = {}
        self.__degree_doc_id = ''
        self.__semester_num = 0
        self.__gdrive_file_id = None
    
    @classmethod
    async def create(cls, university_name: str = ''):
        """
        Creating instance of Result_DB asyncronously
        """

        self = cls()

        if university_name:
            await self.connect_to_university(university_name)
            return self
        else:
            result_db_logger.error("University Name should be provided")
            raise ValueError("University Name should be provided")
    
    async def start_transaction(self):
        """
        It will start transaction
        """

        self.__session = await self._client.start_session(default_transaction_options = txn_options)
        self.__session.start_transaction()
        result_db_logger.info("Transaction started")
    
    async def commit_transaction(self):
        """
        It will commit transaction
        """

        await self.__session.commit_transaction()
        await self.__session.end_session()
        result_db_logger.info("Transaction committed")

    async def abort_transaction(self):
        """
        It will abort transaction
        """

        await self.__session.abort_transaction()
        await self.__session.end_session()
        result_db_logger.info("Transaction aborted")
    
    async def connect_to_university(self, university_name: str, short_name: str = ''):
        """
        It will find university by name. If not found, it will create one. Note: university_name should be a full name
        """

        result_db_logger.info(f"Connecting to {university_name}...")
        short_name = short_name or create_short_form_name(university_name)
        self.__uni_document = await self.__uni_collec.find_one_and_update({
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
    
    async def __create_new_batch(self, batch_num: int):
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
            new_batch = await self.__batch_collec.insert_one({
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
            updated_uni_doc = await self.__uni_collec.find_one_and_update({
                    "_id": self.__uni_document["_id"]
                }, {
                    "$set": {
                        f"batches.{str(batch_num)}": batch_doc_id
                    }
                }, upsert = True,
                return_document = pymongo.ReturnDocument.AFTER
            )
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
    
    async def __create_new_degree(
        self,
        batch_doc_id: int,
        degree_id: str,
        degree_name: str,
        sem_num: int
    ):
        """
        It will create new degree if not already exist and also link with respective batch. In the end it will also return degree doc id
        """

        degree_name, branch_name = divide_degree_and_branch(degree_name)
        degree_doc_id = ''

        # For Folder Name
        if branch_name:
            degree_folder_name = f'{degree_id} - {degree_name} ({branch_name})'
        else:
            degree_folder_name = f'{degree_id} - {degree_name}'
        
        batch_doc = await self.__batch_collec.find_one({
            "_id": batch_doc_id
        })

        if not batch_doc:
            result_db_logger.error(f"Batch {batch_doc_id} not found")
            raise Exception(f"Batch {batch_doc_id} not found")

        # If degree already exist
        if degree_id in batch_doc["degrees"]:
            degree_doc_id = batch_doc["degrees"][degree_id]
            existing_degree = await self.__degree_collec.find_one({
                "_id": degree_doc_id
            }, {
                "folder_id": 1,
                "sem_results": 1
            })
            self.__gdrive_file_id = existing_degree["sem_results"].get(str(sem_num))

            if existing_degree:
                self.__gdrive_upload_folder_id = existing_degree["folder_id"]
                result_db_logger.info(f"Degree {degree_id} - {degree_name} {branch_name if branch_name else ''} already exist")
            else:
                result_db_logger.error(f"Degree {degree_id} - {degree_name} {branch_name if branch_name else ''} not found in database which is linked with batch {batch_doc_id}")
                raise Exception(f"Degree {degree_id} - {degree_name} {branch_name if branch_name else ''} not found in database which is linked with batch {batch_doc_id}")
        
        else:
            result_db_logger.info(f"Creating new degree {degree_id} - {degree_name} {branch_name if branch_name else ''}...")

            self.__gdrive_upload_folder_id = self.__gdrive.create_folder_inside_given_dir(
                degree_folder_name,
                batch_doc["folder_id"],
                self.__final_folder_path_tracker
            )
            new_degree = await self.__degree_collec.insert_one({
                "degree_id": degree_id,
                "degree_name": degree_name,
                "branch_name": branch_name,
                "colleges": list(),
                "subjects": dict(),
                "sem_results": dict(),  # key: sem_num, value: gdrive file id
                "batch_year": batch_doc["batch_num"],
                "batch_id": batch_doc_id,
                "folder_id": self.__gdrive_upload_folder_id
            })
            degree_doc_id = new_degree.inserted_id
            self.__gdrive_file_id = None
            result_db_logger.info(f"Degree {degree_id} - {degree_name} {branch_name if branch_name else ''} created successfully")

            result_db_logger.info(f"Linking degree with batch...")
            updated_batch = await self.__batch_collec.update_one({
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

    async def __adding_updating_new_college_degree(
        self,
        college_id: str,
        college_name: str,
        semester_num: int,
        is_evening_shift: bool = False
    ) -> str:
        """
        It will add or update a new college for a given degree
        """

        # college_folder_name = f'{college_id} - {college_name}'
        shift = 'M'
        updated_degree = None

        degree_doc = await self.__degree_collec.find_one({
            "_id": self.__degree_doc_id,
        }, session = self.__session)

        if is_evening_shift:
            shift = 'E'            

        # Check if college already exist (might have different shift doesn't matter)
        isCollegeExist = any(
            college.get("college_name") == college_name
            for college in degree_doc.get("colleges", [])
        )
      
        # Already college with different shift exist, merge new one with existing one in array and link in degree
        if isCollegeExist:
            result_db_logger.info(f"College {college_id} - {college_name} found with different shift, adding new shift {SHIFT_COLLEGE_MAP[shift]}...")
            updated_degree = await self.__degree_collec.update_one({
                "_id": self.__degree_doc_id,
                "colleges": {
                    "$elemMatch": {
                        f"college_name": college_name
                    }
                }}, {
                    "$set": {
                        f"colleges.$.shifts.{shift}": college_id
                    }, "$addToSet": {
                        "colleges.$.available_semester": semester_num
                    }
                }, session = self.__session
            )
            result_db_logger.info(f"College {college_id} - {college_name} has been successfully added with new shift {SHIFT_COLLEGE_MAP[shift]}")

        # No college with different shift exist, so just push new one in array and link in degree
        else:
            result_db_logger.info(f"Adding new College {college_id} - {college_name} with {SHIFT_COLLEGE_MAP[shift]} shift...")
            updated_degree = await self.__degree_collec.update_one({
                "_id": self.__degree_doc_id
            }, {
                "$push": {
                    "colleges": {
                        "college_name": college_name,
                        "available_semester": [semester_num],
                        "shifts": {
                            shift: college_id
                        }
                    }
                }
            }, session = self.__session)
            result_db_logger.info(f"College {college_id} - {college_name} has been successfully added with shift {SHIFT_COLLEGE_MAP[shift]}")

    async def __add_subjects_to_degree(
        self,
        subject_ids: list[tuple[str, str]]
    ):
        """
        It will add subjects to respected degree in a single batch update
        """

        # Getting existing degree to fetch subjects already added
        existing_degree = await self.__degree_collec.find_one({
            "_id": self.__degree_doc_id
        }, {
            "subjects": 1
        })

        # Adding subjects which are not present in degree
        new_subjects_to_add = {}
        for subject_id, subject_doc_id in subject_ids:
            if subject_id not in existing_degree["subjects"]:
                new_subjects_to_add[f"subjects.{subject_id}"] = subject_doc_id
            
        if not new_subjects_to_add:
            result_db_logger.info(f"Subjects already added to degree")
            return
        
        updated_degree = await self.__degree_collec.update_one(
            {
                "_id": self.__degree_doc_id
            }, {
                "$set": new_subjects_to_add
            }
        )
        if updated_degree.modified_count > 0:
            result_db_logger.info(f"Subjects added to degree successfully")
    
    async def __link_res_file(
        self,
        sem_num: int,
        gdrive_file_id: str
    ):
        """
        It will link result file id in degree document
        """

        result_db_logger.info(f"Linking semester {sem_num} result (file id: {gdrive_file_id}) with degree {self.__degree_doc_id}...")
        await self.__degree_collec.update_one({
            "_id": self.__degree_doc_id
        }, {
            "$set": {
                f"sem_results.{sem_num}": gdrive_file_id
            }
        }, session = self.__session)

        # if updates.modified_count == 0:
        #     result_db_logger.error(f"While linking result file with degree {self.__degree_doc_id}, degree not updated, {updates}")
        #     raise Exception("Degree not updated")
        # else:
        result_db_logger.info(f"Result file linked with degree successfully")
    
    def __get_grade_point(self, grade: str) -> int:
        """
        Return the grade point of given marks
        """
        
        return GRADE_RATING_GGSIPU.get(str(grade).strip(), np.nan)

    def __calculate_cgpa(
        self,
        result_df: pd.DataFrame
    ):
        """
        It will calculate CGPA from result dataframe
        """

        # Function to extract marks and grades
        def extract_marks_and_grade(s):
            try:
                values = literal_eval(s)  # Convert string list to actual list
                return np.sum(values[:-1]), values[-1]  # Sum of marks, last element is grade
            except:
                return np.nan, np.nan  # Handle missing or malformed data

        # Identify relevant subject columns
        subject_cols = [col for col in result_df.columns if col.startswith("sub_") and col.split('_')[-1] in self.__subject_credits_dict]

        # Extract subject credits
        credits = np.array([self.__subject_credits_dict[col.split('_')[-1]] for col in subject_cols])

        # Apply extraction in bulk
        marks_and_grades = result_df[subject_cols].map(extract_marks_and_grade)
        marks_df = marks_and_grades.map(lambda x: x[0])  # Extract marks
        grades_df = marks_and_grades.map(lambda x: x[1])  # Extract grades

        # Convert grades to grade points
        grade_points_df = grades_df.map(lambda g: self.__get_grade_point(g))
        grade_points_df = grade_points_df.astype(float)

        # Compute total marks scored (skip NaN values)
        result_df["total_marks_scored"] = marks_df.sum(axis=1, skipna=True).astype(int)

        # Compute maximum marks possible (100 per valid subject)
        result_df["max_marks_possible"] = marks_df.notna().sum(axis=1) * 100

        # Compute weighted sum and total credits (vectorized)
        weighted_sum = np.nansum(grade_points_df.values * credits, axis=1)
        total_credits = np.nansum(~np.isnan(grade_points_df.values) * credits, axis=1)

        # Prevent division by zero or NaN issues
        total_credits = np.where(total_credits == 0, np.nan, total_credits)

        # Compute CGPA safely
        result_df["cgpa"] = np.where(total_credits > 0, np.round(weighted_sum / total_credits, 2), np.nan)
    
    def reset_subject_data_list(self):
        """
        It will reset subject data list
        """

        self.__subject_credits_dict.clear()

    async def link_all_metadata(
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
        It will link subjects to respective degree, and also make sure to create new batch and degree if they don't exist
        """

        self.__gdrive_file_id = None
        self.__college_id = college_id  # For data storing and uploading in future
        
        batch_doc_id = await self.__create_new_batch(batch)
        self.__degree_doc_id = await self.__create_new_degree(batch_doc_id, degree_id, degree_name, semester_num)
        await self.__add_subjects_to_degree(subject_ids)

        await self.start_transaction()
        await self.__adding_updating_new_college_degree(college_id, college_name, semester_num, is_evening_shift)
        self.__semester_num = semester_num
        
    async def add_subject(
        self,
        subject_name: str,
        subject_code: str,
        subject_id: str,
        subject_credit: int,
        max_internal_marks: int,
        max_external_marks: int,
        passing_marks: int
    ):
        """
        It will create new subject in db and return subject id and subject doc id, and if it is already created then it will just skip
        """

        sub_data = await self.__subject_collec.find_one_and_update(
            {
                "subject_id": subject_id,
                "university_id": self.__uni_document["_id"]
            },  {
                    "$setOnInsert": {
                        "subject_name": subject_name,
                        "subject_code": subject_code,
                        "subject_id": subject_id,
                        "subject_credit": subject_credit,
                        "max_internal_marks": max_internal_marks,
                        "max_external_marks": max_external_marks,
                        "passing_marks": passing_marks,
                        "university_id": self.__uni_document["_id"]
                    }
            }, upsert = True,
            return_document = pymongo.ReturnDocument.BEFORE
        )

        # Storing subject credits to calulate CGPA in future
        self.__subject_credits_dict[subject_id] = subject_credit

        if sub_data:
            return subject_id, sub_data["_id"]
        else:
            sub_data = await self.__subject_collec.find_one({
                "subject_id": subject_id,
                "university_id": self.__uni_document["_id"]
            }, {
                "_id" : 1
            })
            result_db_logger.info(f"Subject {subject_id} - {subject_name} created successfully")

            return subject_id, sub_data["_id"]
    
    async def store_and_upload_result(
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

        # Convert results to dataframe
        student_result_df = pd.DataFrame(student_result_list, dtype=str)
        student_result_df['college_id'] = ''
        student_result_df = student_result_df.astype({"roll_num": "string", "college_id": "string"})

        # Add college id and also calculate cgpa
        student_result_df['college_id'] = self.__college_id
        self.__calculate_cgpa(student_result_df)

        # If file doesn't exist, upload it
        if not self.__gdrive_file_id:
            result_db_logger.info(f"Storing new result...")
            student_result_df.to_csv(file_path, index = False)
            result_gdrive_id = self.__gdrive.upload_file(file_path, self.__gdrive_upload_folder_id)

            await self.__link_res_file(
                sem_num = self.__semester_num,
                gdrive_file_id = result_gdrive_id
            )
            result_db_logger.info(f"Result stored and uploaded successfully")

        # If file exists, update it
        else:
            result_db_logger.info(f"Updating existing result...")

            # Read existing file
            existing_result_content = self.__gdrive.read_gdrive_file(self.__gdrive_file_id)
            existing_df = pd.read_csv(existing_result_content, dtype={"roll_num": "string", "college_id": "string"})

            # Update existing file with new result
            updated_df = pd.concat(
                [existing_df, student_result_df],
                ignore_index = True,
                join = "outer"
            )
            updated_df.to_csv(file_path, index = False)

            # Upload updated file to drive
            self.__gdrive.update_existing_file(self.__gdrive_file_id, file_path)
            result_db_logger.info(f"Result updated and uploaded successfully")
        
        await self.commit_transaction()
        self.__final_folder_path_tracker = self.__uni_document["name"]
    
    async def add_hall_of_fame_student(
        self,
        roll_num: str,
        name: str,
        university_name: str,
        batch: int,
        college_name: str,
        college_id: str,
        semester_num: int
    ):
        """
        It will add student to hall of fame, those who achieved 10cgpa
        """

        result_db_logger.info(f"Adding student {roll_num} - {name} to hall of fame...")
        await self.__hall_of_fame_collec.insert_one({
            "roll_num": roll_num,
            "name": name,
            "university_name": university_name,
            "batch": batch,
            "college_name": college_name,
            "college_id": college_id,
            "semester_num": semester_num
        })
