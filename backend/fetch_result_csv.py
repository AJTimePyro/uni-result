from lib.env import ENV
import os
import pandas as pd
import numpy as np
from backend.fetch_result_db import Fetch_Result_DB
from bson import ObjectId
from backend.models import Subject
from ast import literal_eval

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

class Fetch_Result_CSV:
    __university_name: str
    __batch_year: int
    __degree_id: str
    __semester_num: int
    __result_path: str
    __common_path: str

    def __init__(
        self,
        uni_name: str,
        batch_year: int,
        degree_id: str,
        semester_num: int
    ):
        self.__university_name = uni_name
        self.__batch_year = batch_year
        self.__degree_id = degree_id
        self.__semester_num = semester_num

        self.__result_path = ENV.LOCAL_RESULT_FOLDER_PATH
        self.__common_path = ''
        self.__reach_common_result_folder()
    
    async def get_college_result(self, college_id: str, degree_doc_id: str):
        """
        It will get result file of given college
        """

        # Getting result file
        result_file = self.__find_college_result_file(college_id)
        result_df = pd.read_csv(result_file, dtype={"roll_num": str})

        # Getting all required subject data
        sub_id_list = self.__get_sub_id_list(result_df)
        subject_data_list = await self.__get_subject_data(sub_id_list, degree_doc_id)

        final_result_json = await self.__calculate_cgpa_from_result(result_df, subject_data_list, sub_id_list)

        return final_result_json, subject_data_list

    def __find_college_result_file(self, college_id: str) -> str:
        """
        Return the path of result file of given college
        """

        # Getting college folder which contains result for all semesters of the college
        self.__common_path = self.__find_directory_startsWith(self.__common_path, college_id)
        if self.__common_path is None:
            raise FileNotFoundError(f"Folder with name starting with '{college_id}' not found in {self.__common_path}")

        # Getting result file path
        result_file_path = os.path.join(self.__common_path, f'{self.__semester_num:02d}.csv')
        if not os.path.exists(result_file_path):
            raise FileNotFoundError(f"File '{result_file_path}' not found.")

        return result_file_path

    def __find_directory_startsWith(
        self,
        directory_path: str,
        directory_prefix: str
    ) -> str | None:
        """
        Return the path of directory with given directory prefix
        """

        if not os.path.exists(directory_path):
            raise FileNotFoundError(f"Directory '{directory_path}' not found.")

        for folder_name in os.listdir(directory_path):
            if folder_name.startswith(directory_prefix):
                return os.path.join(directory_path, folder_name)
        else:
            return None

    def __reach_common_result_folder(self):
        """
        It will reach the common result folder
        """

        self.__common_path = os.path.join(self.__result_path, self.__university_name, str(self.__batch_year))
        self.__common_path = self.__find_directory_startsWith(self.__common_path, self.__degree_id)
        if self.__common_path is None:
            raise FileNotFoundError(f"Folder with name starting with '{self.__degree_id}' not found in {self.__result_path}/{self.__university_name}/{self.__batch_year}")
        
    def __get_sub_id_list(self, result_csv: pd.DataFrame) -> list[str]:
        """
        Return the list of subject ids present in the given result column
        """

        sub_id_list = []
        for column in result_csv.columns:
            if column.startswith('sub_'):
                sub_id_list.append(column.split('sub_')[-1])
        return sub_id_list
    
    async def __get_subject_data(self, sub_id_list: list[str], degree_doc_id: str):
        """
        Return the subject data of given subject ids
        """

        fetch_db = Fetch_Result_DB()

        # Getting subject doc ids
        degree_doc = await fetch_db.get_degree(degree_doc_id, return_subjects = True)        
        sub_doc_id_list = [ObjectId(degree_doc.subjects[subject_id]) for subject_id in sub_id_list if subject_id in degree_doc.subjects]

        return await fetch_db.get_all_subjects_by_doc_id(sub_doc_id_list)
    
    async def __calculate_cgpa_from_result(
        self,
        result_df: pd.DataFrame,
        subject_data_list: list[Subject],
        sub_id_list_ordered: list[str]
    ):
        """
        It will calculate CGPA from result dataframe
        """

        def extract_grade_point(value):
            if value:
                try:
                    return self.__get_grade_point(literal_eval(value)[2])
                except:
                    return np.nan
            return np.nan
        
        def extract_total_marks(value):
            if value:
                try:
                    marks = literal_eval(value)
                    return marks[0] + marks[1]  # Internal + External
                except:
                    return 0
            return 0

        # Getting all subject credits
        subject_credits = np.array([sub.subject_credit for sub in subject_data_list])

        # Apply extraction function to all subject columns
        grade_points = result_df.iloc[:, 2:].apply(lambda col: col.map(extract_grade_point))
        total_marks = result_df.iloc[:, 2:].apply(lambda row: row.map(extract_total_marks), axis=1)

        # Create a mask for valid grades
        valid_mask = pd.notna(grade_points)

        # Compute total credits dynamically per student
        student_credits = np.where(valid_mask, subject_credits, 0).sum(axis=1)

        # Compute weighted sum of grade points
        weighted_grade_points = (grade_points * subject_credits).fillna(0).sum(axis=1)

        # Calculate CGPA safely (avoiding division by zero)
        result_df["cgpa"] = np.where(student_credits > 0, np.round(weighted_grade_points / student_credits, 2), 0)

        # Compute total and max marks
        result_df["total_marks_scored"] = total_marks.sum(axis = 1)
        result_df["max_marks_possible"] = (result_df.iloc[:, 2:] != "").sum(axis=1) * 100

        # Sort by CGPA in descending order (highest first)
        result_df.sort_values(by="cgpa", ascending=False, inplace=True)

        # Reset index after sorting
        result_df.reset_index(drop=True, inplace=True)

        # Compute ranks using dense ranking
        result_df["rank"] = result_df["cgpa"].rank(method="min", ascending=False).astype(int)

        # Fill missing values with empty string
        result_df.fillna('', inplace = True)

        return result_df.to_dict(orient="records")

    def __get_grade_point(self, grade: str) -> int:
        """
        Return the grade point of given marks
        """
        
        return GRADE_RATING_GGSIPU[grade]
    