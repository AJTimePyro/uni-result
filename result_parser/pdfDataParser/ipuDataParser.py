from pdfplumber.page import Page
from result_parser.lib.result_db import Result_DB
from result_parser.lib.logger import parser_logger
from result_parser.lib.utils import normalize_spacing, standardize_subject_code
from result_parser.lib.customErrors import OldSessionException
from typing import Union
import re

DEFAULT_STUDENT_RESULT = {
    'roll_num': '',
    'name': '',
    'college_id': '',
    'total_marks_scored': 0,
    'max_marks_possible': 0,
    'cgpa': 0.00,
}

SEMESTER_STR_TO_NUM = {
    "first": 1,
    "second": 2,
    "third": 3,
    "fourth": 4,
    "fifth": 5,
    "sixth": 6,
    "seventh": 7,
    "eighth": 8,
    "ninth": 9,
    "tenth": 10,
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "ten": 10
}

UNIVERSITY_NAME = 'Guru Gobind Singh Indraprastha University'

class IPU_Result_Parser:
    __pdf_pages_list: list[Page]
    __pdf_page_index: int
    __students_result_list: list[dict[str, str | list[int]]]
    __students_result_index: int
    __starting_session: int
    __res_db: Result_DB
    __save_link_metadata_param: dict

    def __init__(self, pdf_pages_list: list[Page] = [], session_start = 2020, page_to_start = 1):
        if not pdf_pages_list:
            parser_logger.error("Page List can't be empty.")
            raise ValueError("Page List can't be empty.")
        
        # Initializing values
        self.__pdf_pages_list = pdf_pages_list
        self.__pdf_page_index = page_to_start - 2   # default -1
        self.__students_result_list = list()
        self.__students_result_index = -1
        self.__starting_session = session_start
        self.__res_db = None
        self.__save_link_metadata_param = dict()
    
    async def start(self):
        self.__res_db = await Result_DB.create(UNIVERSITY_NAME)
        await self.__parsing_pdf_pages()
    
    async def __parsing_pdf_pages(self):
        """
        It will actually start process of parsing pdf to extract results and metadatas
        """

        parser_logger.info("Starting to parse PDF pages")
        if not self.__skip_till_get_subjects_list():
            return
        
        # first_page, page_table = self.__get_next_page()
        # await self.__start_subjects_parser(first_page, page_table)

        while True:
            page_data = self.__get_next_page()
            if page_data is None:
                parser_logger.info("No more pages to parse, storing remaining results...")
                await self.__storing_result()
                break
            next_page, page_table = page_data

            parser_logger.info(f"Parsing page no. {self.__pdf_page_index + 1} ...")

            if self.__is_page_contains_subject_list(next_page):
                parser_logger.info("Found subject list, storing previous results...")
                await self.__storing_result()

                await self.__start_subjects_parser(next_page, page_table)
            else:
                await self.__start_student_results_parser(page_table)
    
    async def __storing_result(self):        
        if len(self.__students_result_list) == 0:
            parser_logger.warning("No results to store, skipping it...")
        else:
            parser_logger.info("Storing and uploading results...")
            await self.__res_db.store_and_upload_result(
                student_result_list = self.__students_result_list
            )

        # Clearing previous results
        self.__students_result_list.clear()
        self.__students_result_index = -1
        self.__res_db.reset_subject_data_list()
        self.__save_link_metadata_param.clear()
    
    def __get_next_page(self) -> tuple[str, list[list[str]]] | None:
        """
        Returns next page data as string, if no next page is found, then it will return None
        """

        if len(self.__pdf_pages_list) == self.__pdf_page_index + 1:
            return None
        self.__pdf_page_index += 1
        return self.__pdf_pages_list[self.__pdf_page_index].extract_text(), self.__pdf_pages_list[self.__pdf_page_index].extract_table()
    
    def __is_page_contains_subject_list(self, page_content: str) -> bool:
        """
        It will check whether given page is of subject list or not
        """

        return "SCHEME OF EXAMINATIONS" in page_content

    def __exam_meta_data_parser(self, raw_exam_meta_data: str) -> Union[dict[str, int | str], None]:
        """
        It will parse Metadata about result, like degree code, degree name, semester number, college code, college name and batch year; and return in dictionary. If page is supposed to be skipped, then it return False else True
        """

        regexStrForExamMetaData = r'(?:Prg\.|Programme) Code:\s*(\d{3})\s+Programme(?: Name)?\s*:\s*(.+)\s+SchemeID:\s*\d+\s+Sem\./(?:Year|Annual):\s*(.+?)\s+(?:SEMESTER|ANNUAL).*\n.*Institution Code:\s*\'?(\d{3})\'?\s+Institution:\s+(.+)\n'

        batch = self.__peek_to_get_batch()
        if batch == 0:
            pass
        elif batch < self.__starting_session:
            parser_logger.error(f"Batch year {batch} is less than starting session year {self.__starting_session}")
            raise OldSessionException(f"Batch year {batch} is less than starting session year {self.__starting_session}")
        
        exam_meta_data_matched_regex = re.search(regexStrForExamMetaData, raw_exam_meta_data)
        if exam_meta_data_matched_regex is None:
            parser_logger.error(f"Failed to parse Exam Meta Data from page no. {self.__pdf_page_index + 1}, raw data: {raw_exam_meta_data}")
            raise ValueError(f"Failed to parse Exam Meta Data from page no. {self.__pdf_page_index + 1}, raw data: {raw_exam_meta_data}")

        degree_code = exam_meta_data_matched_regex.group(1).strip()
        degree_name = exam_meta_data_matched_regex.group(2).strip()
        sem_str = exam_meta_data_matched_regex.group(3).strip()
        college_code = exam_meta_data_matched_regex.group(4).strip()
        college_name = exam_meta_data_matched_regex.group(5).strip()

        semester_num = 0
        if sem_str.isdigit():
            semester_num = self.__get_int_val(sem_str)
        else:
            semester_num = SEMESTER_STR_TO_NUM.get(sem_str.lower(), 0)
            if semester_num == 0:
                parser_logger.error(f"Invalid Semester found... {raw_exam_meta_data}")
                raise ValueError("Invalid Semester Number...")

        updated_college_name = normalize_spacing(college_name)
        
        return {
            'degree_code': degree_code,
            'degree_name': degree_name,
            'semester_num': semester_num,
            'batch': batch,
            'college_code': college_code,
            'college_name': updated_college_name,
            'is_evening_shift': updated_college_name != college_name # Evening Shift have slightly different name(having extra spaces)
        }
    
    def __get_int_val(self, val: str) -> int:
        """
        Return integer value from given string, if string is not integer then it will raise exception
        """

        if val.isdigit():
            return int(val.strip())
        else:
            return 0
    
    def __peek_to_get_batch(self) -> int:
        """
        It will get batch number from the next page
        """

        next_page, _ = self.__get_next_page()
        batch = 0

        if not self.__is_page_contains_subject_list(next_page):
            batch_searched = re.search(r'Batch:\s(\d{4})', next_page)
            batch_str = batch_searched.group(1)
            batch = self.__get_int_val(batch_str)

        self.__pdf_page_index -= 1
        return batch
    
    def __skip_till_get_subjects_list(self):
        """
        It will skip all the pages till it finds subject list, if no page contains subject list then it will return False
        """

        page_data = self.__get_next_page()
        while page_data is not None and not self.__is_page_contains_subject_list(page_data[0]):
            page_data = self.__get_next_page()
        
        if page_data is None:
            parser_logger.error("Pdf doesn't contain subject list at all.")
            return False
        
        self.__pdf_page_index -= 1
        return True
    
    def __self_cleaning_subject_code(self, raw_subject_code: str) -> str:
        """
        It will remove all the extra spaces from subject code
        """

        # Fix line breaks inside words (e.g., '20\n1' -> '201', 'AV\nV' -> 'AVV')
        text = re.sub(r'(?<=\w)[\s\n]+(?=\w)', '', raw_subject_code)

        # Pattern pattern:
        # - Starts with letters
        # - Allows dots, dashes, slashes, parentheses and ampersand
        # - Allows optional space or whitespaces before number
        pattern = r'[A-Z][A-Z.\-/()&]+\s*\d+'

        match = re.search(pattern, text, flags=re.IGNORECASE)
        return match.group().replace(' ', '') if match else None
    
    async def __subject_parser(self, raw_subject_data: list[str], paper_id_index: int):
        """
        It will parse subject data like subject id, subject code, subject name, subject credit, subject type, subject internal marks, subject external marks, subject passing marks
        """

        subject_id = raw_subject_data[paper_id_index].strip()
        subject_name = raw_subject_data[paper_id_index + 2].strip()

        raw_subject_code = raw_subject_data[paper_id_index + 1].strip()
        subject_code = self.__self_cleaning_subject_code(raw_subject_code)
        
        subject_credit_search = re.search(r'(\d{1,2})$', raw_subject_data[paper_id_index + 3])
        if subject_credit_search is None:
            parser_logger.warning(f"Credit is empty, Let's skip it, raw data: {raw_subject_data}")
            return False
        subject_credit = self.__get_int_val(subject_credit_search.group(1))

        if subject_id == '' or subject_code == '' or subject_name == '':
            parser_logger.warning(f"Failed to parse subject data from page no. {self.__pdf_page_index + 1}, raw data: {raw_subject_data}")
            raise ValueError(f"Failed to parse subject data from page no. {self.__pdf_page_index + 1}, raw data: {raw_subject_data}")
        
        subject_passing_marks = self.__get_int_val(raw_subject_data[-1])
        subject_max_marks = self.__get_int_val(raw_subject_data[-2])
        subject_external_marks = self.__get_int_val(raw_subject_data[-3])
        subject_internal_marks = self.__get_int_val(raw_subject_data[-4])

        return await self.__res_db.add_subject(subject_name, subject_code, subject_id, subject_credit, subject_internal_marks, subject_external_marks, subject_passing_marks, subject_max_marks)
    
    async def __subjects_data_parser(self, raw_subjects_table: list[list[str]]):
        """
        It will divide subjects data into individual subject and then parse each subject
        """

        paper_id_index = 0
        if not re.match(r'paper\s*id', raw_subjects_table[0][0].lower()):   # Checking if subjects data starts from 0 or 1, as paper id index will be the starting index of subject data
            paper_id_index = 1

        subject_list = list()
        for subject_num_index in range(1, len(raw_subjects_table)):
            subject_res = await self.__subject_parser(
                raw_subjects_table[subject_num_index],
                paper_id_index
            )
            if subject_res is False:
                return None
            
            subject_id, subject_doc_id = subject_res
            subject_list.append((subject_id, subject_doc_id))
        return subject_list
    
    async def __start_subjects_parser(self, page_data: str, page_table: list[list[str]]):
        """
        It will divide page into two parts, one for metadata and other for subjects data. Then it will parse those two parts
        """

        parser_logger.info("Found subject list, parsing it...")
        sub_id_list = await self.__subjects_data_parser(page_table)
        if not sub_id_list:
            self.__skip_till_get_subjects_list()
            return
        
        try:
            meta_data = self.__exam_meta_data_parser(page_data)
        except OldSessionException:
            self.__skip_till_get_subjects_list()
            return
        
        if not (self.__save_link_metadata_param and (
            meta_data['degree_code'] == self.__save_link_metadata_param['degree_id'] and
            meta_data['college_code'] == self.__save_link_metadata_param['college_id'] and
            meta_data['semester_num'] == self.__save_link_metadata_param['semester_num'] and
            meta_data['is_evening_shift'] == self.__save_link_metadata_param['is_evening_shift']
        )):
            self.__save_link_metadata_param = {
                "subject_ids" : sub_id_list,
                "degree_id" : meta_data['degree_code'],
                "degree_name" : meta_data['degree_name'],
                "batch" : meta_data['batch'],
                "college_id" : meta_data['college_code'],
                "college_name" : meta_data['college_name'],
                "semester_num" : meta_data['semester_num'],
                "is_evening_shift" : meta_data['is_evening_shift']
            }
        else:
            self.__save_link_metadata_param['subject_ids'].extend(sub_id_list)
            self.__save_link_metadata_param['batch'] = meta_data['batch']

        if self.__save_link_metadata_param['batch'] == 0:
            parser_logger.info("Next page is also subject list, going to parse it as well...")
            page_data = self.__get_next_page()
            if not page_data:
                parser_logger.info("No more pages to parse, now parsing student results...")
                return
            parser_logger.info(f"Parsing page no. {self.__pdf_page_index + 1} ...")
            await self.__start_subjects_parser(page_data[0], page_data[1])
        else:
            if self.__save_link_metadata_param['batch'] == 0:
                raise ValueError("Batch number is not found in metadata")
            await self.__res_db.link_all_metadata(
                subject_ids = self.__save_link_metadata_param['subject_ids'],
                degree_id = self.__save_link_metadata_param['degree_id'],
                degree_name = self.__save_link_metadata_param['degree_name'],
                batch = self.__save_link_metadata_param['batch'],
                college_id = self.__save_link_metadata_param['college_id'],
                college_name = self.__save_link_metadata_param['college_name'],
                semester_num = self.__save_link_metadata_param['semester_num'],
                is_evening_shift = self.__save_link_metadata_param['is_evening_shift']
            )
            parser_logger.info("Subject list parsed successfully")
            parser_logger.info("Now parsing student results...")
    
    async def __start_student_results_parser(self, result_table: list[list[str]]):
        """
        This will remove header from page data and then starts parsing
        """
        
        student_index = 1
        while student_index < len(result_table) and result_table[student_index][1]:
            self.__students_result_list.append(DEFAULT_STUDENT_RESULT.copy())
            self.__students_result_index += 1
            await self.__extract_student_result(
                result_table[student_index],
                result_table[student_index + 1],
                result_table[student_index + 2]
            )
            student_index += 3
    
    async def __extract_student_result(
            self,
            student_n_subject_detail: list[str],
            student_int_ext_marks: list[str],
            student_total_marks_n_grade: list[str]
        ):
        """
        It will divide student result into student detail and student marks, and then parse them individually
        """

        self.__extract_student_detail(student_n_subject_detail[1])
        await self.__extract_student_marks(
            student_n_subject_detail,
            student_int_ext_marks,
            student_total_marks_n_grade
        )
    
    def __extract_student_detail(self, raw_student_detail: str):
        """
        It will parse student detail like student roll number and student name
        """

        student_detail_regex_pattern = r'(\d+)\s+(.+?)\s+SID:'
        student_detail_regex_search = re.match(student_detail_regex_pattern, raw_student_detail, re.DOTALL)
        if not student_detail_regex_search:
            parser_logger.error(f"Error while parsing student detail, {raw_student_detail}")
            raise ValueError("Error while parsing student detail")

        student_roll_num = student_detail_regex_search.group(1).strip()
        student_name = student_detail_regex_search.group(2).replace('\n', ' ').strip()

        # Adding student detail to list
        self.__students_result_list[self.__students_result_index]['roll_num'] = student_roll_num
        self.__students_result_list[self.__students_result_index]['name'] = student_name
    
    def __extract_subject_id(self, raw_subject_id_str: str):
        """
        It will extract subject id from raw subject id string
        """

        # Normalize whitespace
        raw_subject_id_str = re.sub(r'\s+', ' ', raw_subject_id_str).strip()

        # Extract part before credit
        credit_match = re.search(r'\((\d+)\)', raw_subject_id_str)
        subject_part = raw_subject_id_str[:credit_match.start()] if credit_match else raw_subject_id_str

        # Normalize subject code: remove duplicate dashes, trim spaces
        subject_code = subject_part.replace(' ', '')
        return subject_code

    async def __extract_student_marks(
        self,
        student_n_subject_detail : list[str],
        student_int_ext_marks : list[str],
        student_total_marks_n_grade : list[str]
    ):
        """
        It will divide student marks into individual subject marks and then parse each subject marks
        """

        regexGrade = r'\d+\s*\(([ABCFPO]\+?)\)'
        subject_start_index = 2
        student_grade_list = []
        while subject_start_index < len(student_n_subject_detail):
            if not student_n_subject_detail[subject_start_index]:   # Maybe result maker skipped one block
                subject_start_index += 2
                continue
            
            subject_id = self.__extract_subject_id(student_n_subject_detail[subject_start_index])
            if not subject_id:
                parser_logger.error(f"Subject ID not found in page no. {self.__pdf_page_index + 1}, raw data: {student_n_subject_detail}")
                raise ValueError(f"Subject ID not found in page no. {self.__pdf_page_index + 1}, raw data: {student_n_subject_detail}")
            if not subject_id.isdigit():
                subject_id = self.__self_cleaning_subject_code(subject_id)
                subject_id = standardize_subject_code(subject_id)
                if self.__res_db.subject_id_code_map.get(subject_id, None) is None:
                    parser_logger.error(f"Subject ID not found in database, raw data: {subject_id}, subject list: {self.__res_db.subject_id_code_map}")
                    raise ValueError(f"Subject ID not found in database, raw data: {subject_id}")
                else:
                    subject_id = self.__res_db.subject_id_code_map[subject_id]
            
            grade = 'F' # If no match found means, it's fail
            grade_match = re.match(regexGrade, student_total_marks_n_grade[subject_start_index])
            if grade_match:
                grade = grade_match.group(1).strip()
            
            internal_marks = self.__get_int_val(student_int_ext_marks[subject_start_index])
            external_marks = self.__get_int_val(student_int_ext_marks[subject_start_index + 1])

            self.__students_result_list[self.__students_result_index][f'sub_{subject_id}'] = [internal_marks, external_marks, grade]
            student_grade_list.append(grade)
            subject_start_index += 2
        
        if all(grade == 'O' for grade in student_grade_list):
            parser_logger.info(f"Student {self.__students_result_list[self.__students_result_index]['roll_num']} got 10 cgpa")

            try:
                # Adding student to hall of fame
                await self.__res_db.add_hall_of_fame_student(
                    self.__students_result_list[self.__students_result_index],
                    UNIVERSITY_NAME,
                    self.__save_link_metadata_param['batch'],
                    self.__save_link_metadata_param['college_name'],
                    self.__save_link_metadata_param['college_id'],
                    self.__save_link_metadata_param['semester_num']
                )
            except Exception as err:
                parser_logger.error(f"Failed to add {self.__students_result_list[self.__students_result_index]['roll_num']} in hall of fame")
                parser_logger.error(err)
