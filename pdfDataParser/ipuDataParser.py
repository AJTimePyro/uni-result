from pypdf import PageObject
import re

class IPU_Result_Parser:
    __pdf_pages_list: list[PageObject]
    __pdf_page_index: int

    def __init__(self, pdf_pages_list: list[PageObject] = []):
        if not pdf_pages_list:
            raise ValueError("Page List can't be empty.")
        self.__pdf_pages_list = pdf_pages_list
        self.__pdf_page_index = -1
    
    def __parsing_pdf_pages(self):
        """
        It will actually start process of parsing pdf to extract results and metadatas
        """

        first_page = self.__get_next_page()
        if self.__is_page_contains_subject_list(first_page):
            self.__start_subjects_parser(first_page)
        else:
            raise Exception("First page doesn't contain subject list.")
        
        for page in self.__pdf_pages_list:
            page_data = page.extract_text()

            if self.__is_page_contains_subject_list(page_data):
                pass
            else:
                self.__student_result_parser()
    
    def __get_next_page(self) -> str:
        """
        Returns next page data as string
        """

        self.__pdf_page_index += 1
        return self.__pdf_pages_list[self.__pdf_page_index].extract_text()
    
    def __is_page_contains_subject_list(self, page_content: str) -> bool:
        """
        It will check whether given page is of subject list or not
        """

        return not page_content.startswith("RESULT TABULATION SHEET")

    def __exam_meta_data_parser(self, raw_exam_meta_data: str):
        """
        It will parse Metadata about result, like degree code, degree name, semester number, college code, college name and batch year
        """

        regexStrForExamMetaData = r'Programme Code:\s(\d{3})\s+Programme Name:\s([a-zA-Z\s]+)\s+SchemeID:\s\d+\s+Sem./Year:\s(\d{2})\s+SEMESTER\s+Institution Code:\s+(\d{3})\s+Institution:\s+([a-zA-Z\s]+)\n'
        exam_meta_data_matched_regex = re.search(regexStrForExamMetaData, raw_exam_meta_data)

        degree_code = self.__get_int_val(exam_meta_data_matched_regex.group(1))
        degree_name = exam_meta_data_matched_regex.group(2)
        semester_num = self.__get_int_val(exam_meta_data_matched_regex.group(3))
        college_code = self.__get_int_val(exam_meta_data_matched_regex.group(4))
        college_name = exam_meta_data_matched_regex.group(5)
        batch = self.__peek_to_get_batch()
    
    def __get_int_val(self, val: str) -> int:
        """
        Return integer value from given string, if string is not integer then it will raise exception
        """

        if val.isdigit():
            return int(val.strip())
        else:
            raise ValueError("Value is not integer.")
    
    def __peek_to_get_batch(self) -> int:
        """
        It will get batch number from the next page
        """

        next_page = self.__get_next_page()
        batch_searched = re.search(r'Batch:\s(\d{4})', next_page)
        batch_str = batch_searched.group(1)

        self.__pdf_page_index -= 1
        return self.__get_int_val(batch_str)
    
    def __subject_parser(self, raw_subject_data: str):
        """
        It will parse subject data like subject id, subject code, subject name, subject credit, subject type, subject internal marks, subject external marks, subject passing marks
        """

        subject_detail = re.match(r'(\d{6})\s+(\w{2}-\d{3})\s+([a-zA-z\s-]+)\s+(\d{1,2})\s+(PRACTICAL|THEORY).+(\d{2,3})\s+(\d{2,3})\s+\d{2,3}\s+(\d{2,3})', raw_subject_data)

        subject_id = subject_detail.group(1)
        subject_code = subject_detail.group(2)
        subject_name = subject_detail.group(3).strip()
        subject_credit = self.__get_int_val(subject_detail.group(4))
        subject_type = subject_detail.group(5)
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
        self.__exam_meta_data_parser(exam_meta_data)
        self.__subjects_data_parser(subjects_raw_details)
    
    def __student_result_parser(self):
        pass
    