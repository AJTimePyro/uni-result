from pypdf import PageObject
import re
import pdfParser
import time

class IPU_Result_Parser:
    __pdf_pages_list: list[PageObject]
    __pdf_page_index: int

    def __init__(self, pdf_pages_list: list[PageObject] = []):
        if not pdf_pages_list:
            raise ValueError("Page List can't be empty.")
        self.__pdf_pages_list = pdf_pages_list
        self.__pdf_page_index = -1
    
    def start(self):
        self.__parsing_pdf_pages()
    
    def __parsing_pdf_pages(self):
        """
        It will actually start process of parsing pdf to extract results and metadatas
        """

        first_page = self.__get_next_page()
        if self.__is_page_contains_subject_list(first_page):
            self.__start_subjects_parser(first_page)
        else:
            raise Exception("First page doesn't contain subject list.")

        while True:
            next_page = self.__get_next_page()
            if next_page is None:
                break

            if self.__is_page_contains_subject_list(next_page):
                self.__start_subjects_parser(next_page)
            else:
                self.__start_student_results_parser(next_page)
    
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

    def __exam_meta_data_parser(self, raw_exam_meta_data: str) -> bool:
        """
        It will parse Metadata about result, like degree code, degree name, semester number, college code, college name and batch year. If page is supposed to be skipped, then it return False else True
        """

        # print(raw_exam_meta_data, end='\n\n')
        regexStrForExamMetaData = r'Programme Code:\s(\d{3})\s+Programme Name:\s+(.+)\s+SchemeID:\s\d+\s+Sem./Year:\s(\d{2})\s+SEMESTER\s+Institution Code:\s+(\d{3})\s+Institution:\s+(.+)\n'
        exam_meta_data_matched_regex = re.search(regexStrForExamMetaData, raw_exam_meta_data)

        degree_code = self.__get_int_val(exam_meta_data_matched_regex.group(1))
        degree_name = exam_meta_data_matched_regex.group(2).strip()
        semester_num = self.__get_int_val(exam_meta_data_matched_regex.group(3))
        college_code = self.__get_int_val(exam_meta_data_matched_regex.group(4))
        college_name = exam_meta_data_matched_regex.group(5).strip()
        batch = self.__peek_to_get_batch()
        if batch == 0:
            return False

        # print(college_name, degree_name, semester_num, batch)
        return True
    
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
    
    def __subject_parser(self, raw_subject_data: str):
        """
        It will parse subject data like subject id, subject code, subject name, subject credit, subject type, subject internal marks, subject external marks, subject passing marks
        """

        # print(raw_subject_data, end='\n\n')
        regexStrForSubjectData = r'(\d{6})\s+(\w+\s*-?\d{3})\s+(.+)\s+(\d{1,2})\s+(PRACTICAL|THEORY).+(\d{2,3}|--)\s+(\d{2,3})\s+\d{2,3}\s+(\d{2,3})'
        subject_detail = re.search(regexStrForSubjectData, raw_subject_data)

        subject_id = subject_detail.group(1)
        subject_code = subject_detail.group(2)
        subject_name = subject_detail.group(3).strip()
        subject_credit = self.__get_int_val(subject_detail.group(4))
        subject_type = subject_detail.group(5)
        
        # if subject_detail.group(6) == '--':
        #     subject_internal_marks = 0
        # else:
        #     subject_internal_marks = self.__get_int_val(subject_detail.group(6))
        subject_internal_marks = self.__get_int_val(subject_detail.group(6))
        subject_external_marks = self.__get_int_val(subject_detail.group(7))
        subject_passing_marks = self.__get_int_val(subject_detail.group(8))
    
    def __subjects_data_parser(self, raw_subjects_data: str):
        """
        It will divide subjects data into individual subject and then parse each subject
        """

        for raw_subject_data in raw_subjects_data.split('\n'):
            self.__subject_parser(raw_subject_data)
    
    def __start_subjects_parser(self, page_data: str):
        """
        It will divide page into two parts, one for metadata and other for subjects data. Then it will parse those two parts
        """

        # Getting index from where subjects actually starts
        subjects_start_index = re.search(r'Pass Marks', page_data).end()

        # Splitting page data into two parts, one contains exam meta data and other will contain actual subject data
        exam_meta_data = page_data[:subjects_start_index]
        subjects_raw_details = page_data[subjects_start_index:].strip()

        # Parsing exam meta data as well as subjects data
        if not self.__exam_meta_data_parser(exam_meta_data):
            return
        self.__subjects_data_parser(subjects_raw_details)
    
    def __start_student_results_parser(self, page_data: str):
        """
        This will remove header from page data and then starts parsing
        """

        # Getting index from where result actually starts
        result_start_index = re.search(r'RTSID:\s+\d+\s*\n', page_data).end()

        raw_result = page_data[result_start_index:].strip()
        students_raw_result_list = self.__get_students_raw_result_list(raw_result)

        for student_raw_result in students_raw_result_list:
            self.__extract_student_result(student_raw_result)
    
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
    
    def __extract_student_result(self, raw_student_data: str):
        """
        It will divide student result into student detail and student marks, and then parse them individually
        """

        # Getting index of where result actually starts
        result_start_index = re.search(r'SchemeID:\s+\d{12}\s+', raw_student_data).end()

        student_detail = raw_student_data[:result_start_index].strip()
        student_marks = raw_student_data[result_start_index:].strip()

        self.__extract_student_detail(student_detail)
        self.__extract_student_marks(student_marks)
    
    def __extract_student_detail(self, raw_student_detail: str):
        """
        It will parse student detail like student roll number and student name
        """

        student_detail_regex_pattern = r'(\d{11})\s+(.+?)\s+SID:'
        student_detail_regex_search = re.search(student_detail_regex_pattern, raw_student_detail)

        student_roll_num = student_detail_regex_search.group(1).strip()
        student_name = student_detail_regex_search.group(2).strip()

    def __extract_student_marks(self, raw_student_marks: str):
        student_mark_list = self.__get_student_marks_list(raw_student_marks)

        for student_mark in student_mark_list:
            self.__extract_student_score(student_mark)
    
    def __get_student_marks_list(self, raw_student_marks: str) -> list[str]:
        student_mark_list = []
        end_index = 0
        subject_ids_iter = re.finditer(r'\d{6}', raw_student_marks)

        for subject_id_iter in subject_ids_iter:
            start_index = end_index
            end_index = subject_id_iter.start()
            if end_index == 0:
                continue
            student_mark_list.append(raw_student_marks[start_index: end_index].strip())
        student_mark_list.append(raw_student_marks[start_index: ].strip())
        return student_mark_list
    
    def __extract_student_score(self, raw_student_score: str):
        student_score_regex_match = re.match(r'(\d{6})\((\d{1,2})\)\s+([0-9ACD-]+)\s+([0-9ACD]+)\s+([0-9ACD]+)(?:\(([ABFO]\+?)\))?', raw_student_score)

        subject_id = student_score_regex_match.group(1)
        subject_credit = self.__get_int_val(student_score_regex_match.group(2))
        internal_marks = self.__get_int_val(student_score_regex_match.group(3))
        external_marks = self.__get_int_val(student_score_regex_match.group(4))
        total_marks = self.__get_int_val(student_score_regex_match.group(5))
        grade = student_score_regex_match.group(6)

# if __name__ == "__main__":
#     t1 = time.time()
#     # obj = pdfParser.PDFParser('')
#     obj = pdfParser.PDFParser('')
#     obj.parsePdf()
#     parser = IPU_Result_Parser(obj.pdf_pages_list)
#     parser.start()
#     print(time.time() - t1)