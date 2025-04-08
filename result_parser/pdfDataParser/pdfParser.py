from pypdf import PdfReader, PageObject
import os

class PDFParser:
    __filePath : str | None
    __pdf_pointer : PdfReader | None
    pdf_pages_list : list[PageObject]

    def __init__(self, filePath = ''):
        if not filePath:
            raise ValueError("File path cannot be empty.")
        elif not os.path.isfile(filePath):
            raise FileNotFoundError("File does not exist.")
        else:
            self.__filePath = filePath
        self.__pdf_pointer = None

    def __get_pdf_pointer(self):
        self.__pdf_pointer = PdfReader(self.__filePath)
    
    def __parsing_pdf_pages(self):
        self.pdf_pages_list = self.__pdf_pointer.pages
    
    def parsePdf(self):
        self.__get_pdf_pointer()
        self.__parsing_pdf_pages()
