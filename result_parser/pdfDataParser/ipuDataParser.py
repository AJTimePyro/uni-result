from pypdf import PageObject
from result_parser.lib.result_db import Result_DB
from result_parser.lib.logger import parser_logger
from result_parser.lib.utils import normalize_spacing
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

UNIVERSITY_NAME = 'Guru Gobind Singh Indraprastha University'

class IPU_Result_Parser:
    __pdf_pages_list: list[PageObject]
    __pdf_page_index: int
    __students_result_list: list[dict[str, str | list[int]]]
    __students_result_index: int
    __starting_session: int
    __res_db: Result_DB

    def __init__(self, pdf_pages_list: list[PageObject] = [], session_start = 2020):
        if not pdf_pages_list:
            parser_logger.error("Page List can't be empty.")
            raise ValueError("Page List can't be empty.")
        
        # Initializing values
        self.__pdf_pages_list = pdf_pages_list
        self.__pdf_page_index = -1
        self.__students_result_list = list()
        self.__students_result_index = -1
        self.__starting_session = session_start
        self.__res_db = None
    
    async def start(self):
        self.__res_db = await Result_DB.create(UNIVERSITY_NAME)
        await self.__parsing_pdf_pages()
    
    async def __parsing_pdf_pages(self):
        """
        It will actually start process of parsing pdf to extract results and metadatas
        """

        parser_logger.info("Starting to parse PDF pages")
        self.__skip_till_get_subjects_list()
        first_page = self.__get_next_page()
        if self.__is_page_contains_subject_list(first_page):
            await self.__start_subjects_parser(first_page)
        else:
            parser_logger.error("First page doesn't contain subject list.")
            raise Exception("First page doesn't contain subject list.")

        while True:
            next_page = self.__get_next_page()
            if next_page is None:
                parser_logger.info("No more pages to parse, storing remaining results...")
                await self.__storing_result()
                break

            parser_logger.info(f"Parsing page no. {self.__pdf_page_index + 1} ...")

            if self.__is_page_contains_subject_list(next_page):
                parser_logger.info("Found subject list, storing previous results...")
                await self.__storing_result()

                await self.__start_subjects_parser(next_page)
            else:
                await self.__start_student_results_parser(next_page)
    
    async def __storing_result(self):
        if len(self.__students_result_list) == 0:
            parser_logger.warning("No results to store, skipping it...")
            return
        
        parser_logger.info("Storing and uploading results...")
        await self.__res_db.store_and_upload_result(
            student_result_list = self.__students_result_list
        )

        # Clearing previous results
        self.__students_result_list.clear()
        self.__students_result_index = -1
    
    def __get_next_page(self) -> str | None:
        """
        Returns next page data as string, if no next page is found, then it will return None
        """

        if len(self.__pdf_pages_list) == self.__pdf_page_index + 1:
            return None
        self.__pdf_page_index += 1
        return self.__pdf_pages_list[self.__pdf_page_index].extract_text()
    
    def __is_page_contains_subject_list(self, page_content: str) -> bool:
        """
        It will check whether given page is of subject list or not
        """

        return not page_content.startswith("RESULT TABULATION SHEET")

    def __exam_meta_data_parser(self, raw_exam_meta_data: str) -> Union[dict[str, int | str], None]:
        """
        It will parse Metadata about result, like degree code, degree name, semester number, college code, college name and batch year; and return in dictionary. If page is supposed to be skipped, then it return False else True
        """

        regexStrForExamMetaData = r'Programme Code:\s(\d{3})\s+Programme Name:\s+(.+)\s+SchemeID:\s\d+\s+Sem./Year:\s(\d{2})\s+SEMESTER\s+Institution Code:\s+(\d{3})\s+Institution:\s+(.+)\n'

        batch = self.__peek_to_get_batch()
        if batch == 0:
            return None
        elif batch < self.__starting_session:
            raise OldSessionException(f"Batch year {batch} is less than starting session year {self.__starting_session}")
        
        exam_meta_data_matched_regex = re.search(regexStrForExamMetaData, raw_exam_meta_data)

        degree_code = exam_meta_data_matched_regex.group(1)
        degree_name = exam_meta_data_matched_regex.group(2).strip()
        semester_num = self.__get_int_val(exam_meta_data_matched_regex.group(3))
        college_code = exam_meta_data_matched_regex.group(4).strip()
        college_name = exam_meta_data_matched_regex.group(5).strip()

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

        next_page = self.__get_next_page()
        batch = 0

        if not self.__is_page_contains_subject_list(next_page):
            batch_searched = re.search(r'Batch:\s(\d{4})', next_page)
            batch_str = batch_searched.group(1)
            batch = self.__get_int_val(batch_str)

        self.__pdf_page_index -= 1
        return batch
    
    def __skip_till_get_subjects_list(self):
        """
        It will skip all the pages till it finds subject list
        """

        next_page = self.__get_next_page()
        while next_page is not None and not self.__is_page_contains_subject_list(next_page):
            next_page = self.__get_next_page()
        
        self.__pdf_page_index -= 1
    
    async def __subject_parser(self, raw_subject_data: str):
        """
        It will parse subject data like subject id, subject code, subject name, subject credit, subject type, subject internal marks, subject external marks, subject passing marks
        """

        regexStrForSubjectData = r'(\d{6})\s+(\w+\s*-?\d{3})\s+(.+)\s+(\d{1,2})\s+(PRACTICAL|THEORY).+(\d{2,3}|--)\s+(\d{2,3})\s+\d{2,3}\s+(\d{2,3})'
        subject_detail = re.search(regexStrForSubjectData, raw_subject_data)

        subject_id = subject_detail.group(1)
        subject_code = subject_detail.group(2)
        subject_name = subject_detail.group(3).strip()
        subject_credit = self.__get_int_val(subject_detail.group(4))
        subject_type = subject_detail.group(5)
        
        subject_internal_marks = self.__get_int_val(subject_detail.group(6))
        subject_external_marks = self.__get_int_val(subject_detail.group(7))
        subject_passing_marks = self.__get_int_val(subject_detail.group(8))

        return await self.__res_db.add_subject(subject_name, subject_code, subject_id, subject_credit, subject_internal_marks, subject_external_marks, subject_passing_marks)
    
    async def __subjects_data_parser(self, raw_subjects_data: str):
        """
        It will divide subjects data into individual subject and then parse each subject
        """

        self.__res_db.reset_subject_data_list()
        subject_list = list()
        for raw_subject_data in raw_subjects_data.split('\n'):
            subject_res = await self.__subject_parser(raw_subject_data)
            subject_id, subject_doc_id = subject_res
            subject_list.append((subject_id, subject_doc_id))
        return subject_list
    
    async def __start_subjects_parser(self, page_data: str):
        """
        It will divide page into two parts, one for metadata and other for subjects data. Then it will parse those two parts
        """

        parser_logger.info("Found subject list, parsing it...")

        # Getting index from where subjects actually starts
        subjects_start_index = re.search(r'Pass Marks', page_data).end()

        # Splitting page data into two parts, one contains exam meta data and other will contain actual subject data
        exam_meta_data = page_data[:subjects_start_index]
        subjects_raw_details = page_data[subjects_start_index:].strip()

        # Parsing exam meta data as well as subjects data
        try:
            meta_data = self.__exam_meta_data_parser(exam_meta_data)
            if meta_data is None:
                parser_logger.warning("Next page is also subject list, skipping this page...")
                return
        except OldSessionException as err:
            parser_logger.warning(err.message + " ,Skipping pages till finding new subject list...")
            self.__skip_till_get_subjects_list()
            return
        
        self.__tmp_meta_data = meta_data

        subject_id_list = await self.__subjects_data_parser(subjects_raw_details)
        await self.__res_db.link_all_metadata(
            subject_ids = subject_id_list,
            degree_id = meta_data['degree_code'],
            degree_name = meta_data['degree_name'],
            batch = meta_data['batch'],
            college_id = meta_data['college_code'],
            college_name = meta_data['college_name'],
            semester_num = meta_data['semester_num'],
            is_evening_shift = meta_data['is_evening_shift']
        )
        parser_logger.info("Subject list parsed successfully")
        parser_logger.info("Now parsing student results...")
    
    async def __start_student_results_parser(self, page_data: str):
        """
        This will remove header from page data and then starts parsing
        """

        # Getting index from where result actually starts
        result_start_index = re.search(r'RTSID:\s+\d+\s*\n', page_data).end()

        raw_result = page_data[result_start_index:].strip()
        students_raw_result_list = self.__get_students_raw_result_list(raw_result)

        for student_raw_result in students_raw_result_list:
            self.__students_result_list.append(DEFAULT_STUDENT_RESULT.copy())
            self.__students_result_index += 1
            await self.__extract_student_result(student_raw_result)
    
    def __get_students_raw_result_list(self, raw_result: str) -> list[str]:
        """
        It will divide raw result into individual student result list
        """

        result_list = []
        start_index = 0
        roll_nums_iter = re.finditer(r'\b\d{11}\b', raw_result)

        for roll_num_iter in roll_nums_iter:
            end_index = roll_num_iter.start()
            if end_index == 0:
                continue
            result_list.append(raw_result[start_index: end_index])
            start_index = end_index
        result_list.append(raw_result[start_index: ])
        return result_list
    
    async def __extract_student_result(self, raw_student_data: str):
        """
        It will divide student result into student detail and student marks, and then parse them individually
        """

        # Getting index of where result actually starts
        result_start_index = re.search(r'SchemeID:\s+\d{12}\s+', raw_student_data).end()

        student_detail = raw_student_data[:result_start_index].strip()
        student_marks = raw_student_data[result_start_index:].strip()

        self.__extract_student_detail(student_detail)
        await self.__extract_student_marks(student_marks)
    
    def __extract_student_detail(self, raw_student_detail: str):
        """
        It will parse student detail like student roll number and student name
        """

        student_detail_regex_pattern = r'(\d{11})\s+(.+?)\s+SID:'
        student_detail_regex_search = re.search(student_detail_regex_pattern, raw_student_detail)

        student_roll_num = student_detail_regex_search.group(1).strip()
        student_name = student_detail_regex_search.group(2).strip()

        # Adding student detail to list
        self.__students_result_list[self.__students_result_index]['roll_num'] = student_roll_num
        self.__students_result_list[self.__students_result_index]['name'] = student_name

    async def __extract_student_marks(self, raw_student_marks: str):
        """
        It will divide student marks into individual subject marks and then parse each subject marks
        """

        student_mark_list = self.__get_student_marks_list(raw_student_marks)
        student_grade_list = []

        for student_mark in student_mark_list:
            grade = self.__extract_student_score(student_mark)
            student_grade_list.append(grade)
        
        if all(grade == 'O' for grade in student_grade_list):
            parser_logger.info(f"Student {self.__students_result_list[self.__students_result_index]['roll_num']} got 10 cgpa")

            try:
                # Adding student to hall of fame
                await self.__res_db.add_hall_of_fame_student(
                    self.__students_result_list[self.__students_result_index]['roll_num'],
                    self.__students_result_list[self.__students_result_index]['name'],
                    UNIVERSITY_NAME,
                    self.__tmp_meta_data['batch'],
                    self.__tmp_meta_data['college_name'],
                    self.__tmp_meta_data['college_code'],
                    self.__tmp_meta_data['semester_num']
                )
            except Exception as err:
                parser_logger.error(f"Failed to add {self.__students_result_list[self.__students_result_index]['roll_num']} in hall of fame")
                parser_logger.error(err)
    
    def __get_student_marks_list(self, raw_student_marks: str) -> list[str]:
        """
        It will divide student marks into individual subject marks list
        """

        student_mark_list = []
        end_index = 0
        subject_ids_iter = re.finditer(r'\d{6}', raw_student_marks)

        for subject_id_iter in subject_ids_iter:
            start_index = end_index
            end_index = subject_id_iter.start()
            if end_index == 0:
                continue
            student_mark_list.append(raw_student_marks[start_index: end_index].strip())
        student_mark_list.append(raw_student_marks[end_index: ].strip())
        return student_mark_list
    
    def __extract_student_score(self, raw_student_score: str) -> str:
        """
        It will parse student marks like subject id, subject credit, internal marks, external marks, total marks and grade. Also it returns grade
        """

        student_score_regex_match = re.match(r'(\d{6})\((\d{1,2})\)\s+([0-9ACD-]+)\s+([0-9ACD]+)\s+([0-9ACD]+)(?:\(([ABCFPO]\+?)\))?', raw_student_score)

        subject_id = student_score_regex_match.group(1)
        subject_credit = self.__get_int_val(student_score_regex_match.group(2))
        internal_marks = self.__get_int_val(student_score_regex_match.group(3))
        external_marks = self.__get_int_val(student_score_regex_match.group(4))
        total_marks = self.__get_int_val(student_score_regex_match.group(5))
        grade = student_score_regex_match.group(6)
        if grade == None:
            grade = 'F'

        # Adding student marks to list
        self.__students_result_list[self.__students_result_index][f'sub_{subject_id}'] = [internal_marks, external_marks, grade]

        return grade
