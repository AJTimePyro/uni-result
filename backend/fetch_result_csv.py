from lib.env import ENV
import os
import pandas as pd

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
    
    def get_college_result(self, college_id: str):
        """
        It will get result file of given college
        """

        # Getting result file
        result_file = self.__find_college_result_file(college_id)
        result_df = pd.read_csv(result_file)

        # Getting subject ids
        sub_id_list = self.__get_sub_id_list(result_df)

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
    
    def __get_subject_data(self, sub_id_list: list[str]):
        """
        Return the subject data of given subject ids
        """

        # TODO
        return

