from lib.env import ENV
import os
import pandas as pd
import numpy as np
from backend.fetch_result_db import Fetch_Result_DB
from bson import ObjectId
from backend.models import Subject
from ast import literal_eval
from lib.gdrive import GDrive

gDrive = GDrive()

class Fetch_Result_CSV:
    __college_id: str
    __degree_doc_id: str
    __semester_num: int
    __result_file_id: str

    def __init__(
        self,
        college_id: str,
        degree_doc_id: str,
        semester_num: int
    ):
        self.__college_id = college_id
        self.__degree_doc_id = degree_doc_id
        self.__semester_num = semester_num
        self.__result_file_id = result_file_id
    
    async def get_college_result(self):
        """
        It will get result file of given college
        """

        # Getting result file
        get_result_data = gDrive.read_gdrive_file(self.__result_file_id)
        result_df = pd.read_csv(get_result_data, dtype=str)

        # Getting all required subject data
        sub_id_list = self.__get_sub_id_list(result_df)
        subject_data_list = await self.__get_subject_data(sub_id_list, self.__degree_doc_id)

        # Getting final result
        final_result_df = self.__get_single_college_result(result_df, self.__college_id)
        self.__assign_ranks(final_result_df)

        return final_result_df.sort_values(by="rank", ascending=True).to_dict(orient="records"), subject_data_list
        
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
    
    def __get_single_college_result(
        self,
        result_df: pd.DataFrame,
        clg_id: str
    ):
        """
        Return the result of given college
        """

        clg_result_df = result_df[result_df['college_id'] == clg_id]
        return clg_result_df.fillna("")
    
    def __assign_ranks(
        self,
        result_df: pd.DataFrame
    ):
        """
        It will assign ranks to the result dataframe
        """

        result_df['rank'] = result_df['cgpa'].rank(method='dense', ascending=False).astype(int)
