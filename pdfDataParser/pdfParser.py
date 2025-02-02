from pypdf import PdfReader, PageObject
import os

class PDFParser:
    __filePath : str | None
    __pdf_pointer : PdfReader | None
    pdf_pages_list : List[PageObject]

    def __init__(self, filePath = ''):
        if not filePath:
            self.__filePath = filePath
        self.__pdf_pointer = None
    
    @property
    def filePath(self):
        if self.filePath is None:
            raise ValueError("No file path provided.")
        return self.__filePath
    
    @filePath.setter
    def filePath(self, value: str):
        if not value:
            raise ValueError("File path cannot be empty.")
        elif os.path.isfile(value):
            raise ValueError("File does not exist.")
        self.__filePath = value

    def __get_pdf_pointer(self):
        self.__pdf_pointer = PdfReader(self.filePath)
    
    def __parsing_pdf_pages(self, page_number: int):
        self.pdf_pages_list = self.__pdf_pointer.pages
    
    def parsePdf(self):
        self.__get_pdf_pointer()
        self.__parsing_pdf_pages()
