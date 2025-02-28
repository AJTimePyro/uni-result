from pdfDataParser.pdfParser import PDFParser
from pdfDataParser.ipuDataParser import IPU_Result_Parser

def test_func(pdf_path: str):
    pdfParser = PDFParser(pdf_path)
    pdfParser.parsePdf()
    parser = IPU_Result_Parser(pdfParser.pdf_pages_list)
    parser.start()

