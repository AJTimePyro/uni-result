import pdfplumber
from pdfplumber.pdf import PDF
from pdfplumber.page import Page
from result_parser.lib.utils import is_valid_url
from io import BytesIO
import os
import requests

class PDFParser:
    __stream_content : str | None
    __pdf_pointer : PDF | None
    pdf_pages_list : list[Page]

    def __init__(self, filePath = '', pdf_url = ''):
        if not filePath and not pdf_url:
            raise ValueError("Either filePath or pdf_url should be provided.")
        
        if filePath:
            if not os.path.isfile(filePath):
                raise FileNotFoundError("File does not exist.")
            else:
                self.__stream_content = filePath
        else:
            if not is_valid_url(pdf_url):
                raise ValueError("Invalid URL.")
            else:
                self.__stream_content = self.__read_pdf_from_url(pdf_url)
        
        self.__pdf_pointer = None

    def __get_pdf_pointer(self):
        self.__pdf_pointer = pdfplumber.open(self.__stream_content)
    
    def __parsing_pdf_pages(self):
        self.pdf_pages_list = self.__pdf_pointer.pages
    
    def __read_pdf_from_url(self, url: str):
        res = requests.get(url)
        return BytesIO(res.content)
    
    def parsePdf(self):
        self.__get_pdf_pointer()
        self.__parsing_pdf_pages()
