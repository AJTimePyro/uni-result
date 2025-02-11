from pypdf import PageObject

class IPU_Result_Parser:
    self.__pdf_pages_list: list[PageObject]

    def __init__(self, pdf_pages_list: list[PageObject] = []):
        if not pdf_pages_list:
            raise ValueError("Page List can't be empty.")
        self.__pdf_pages_list = pdf_pages_list
    
    def __parsing_pdf_pages(self):
        first_page = self.__pdf_pages_list[0].extract_text()
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
    
    def __is_page_contains_subject_list(self, page_content: str) -> bool:
        return not page_content.startswith("RESULT TABULATION SHEET")

    def __exam_meta_data_parser(self, raw_exam_meta_data: str):
        regexStrForExamMetaData = r'Programme Code:\s(\d{3})\s+Programme Name:\s([a-zA-Z\s]+)\s+SchemeID:\s\d+\s+Sem./Year:\s(\d{2})'

        exam_meta_data_matched_regex = re.search(regexStrForExamMetaData, raw_exam_meta_data)

        programme_code = exam_meta_data_matched_regex.group(1)
        programme_name = exam_meta_data_matched_regex.group(2)
        semester_num = exam_meta_data_matched_regex.group(3)
    
    def __subject_parser(self, raw_subject_data: str):
        subject_detail = re.search(r'(\d{6})\s+(\w{2}-\d{3})\s+([a-zA-z\s-]+)\s+(\d{1,2})\s+(PRACTICAL|THEORY).+(\d{2,3})\s+(\d{2,3})\s+\d{2,3}\s+(\d{2,3})', raw_subject_data)

        subject_id = subject_detail.group(1)
        subject_code = subject_detail.group(2)
        subject_name = subject_detail.group(3).strip()
        subject_credit = subject_detail.group(4)
        subject_type =subject_detail.group(5)
        subject_internal_marks = subject_detail.group(6)
        subject_external_marks = subject_detail.group(7)
        subject_passing_marks = subject_detail.group(8)
    
    def __subjects_data_parser(self, raw_subjects_data: str):
        for raw_subject_data in raw_subjects_data.split('\n'):
            self.__subject_parser(raw_subject_data)
    
    def __start_subjects_parser(self, page_data: str):
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
    