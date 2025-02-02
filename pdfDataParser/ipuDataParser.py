from pypdf import PageObject

class IPU_Result_Parser:
    self.__pdf_pages_list: list[PageObject]

    def __init__(self, pdf_pages_list: list[PageObject] = []):
        if not pdf_pages_list:
            raise ValueError("Page List can't be empty.")
        self.__pdf_pages_list = pdf_pages_list
    
    def __parsing_pdf_pages(self):
        for page in self.__pdf_pages_list:
            page_data = page.extract_text()

            if self.__is_page_contains_subject_list(page_data):
                pass
            else:
                self.__student_result_parser()
    
    def __is_page_contains_subject_list(self, page_content: str) -> bool:
        return not page_content.startswith("RESULT TABULATION SHEET")
    
    def __student_result_parser(self):
        pass
    