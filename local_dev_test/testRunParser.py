from result_parser.pdfDataParser.pdfParser import PDFParser
from result_parser.pdfDataParser.ipuDataParser import IPU_Result_Parser

async def test_func(pdf_path: str):
    pdfParser = PDFParser(pdf_path)
    pdfParser.parsePdf()
    parser = IPU_Result_Parser(pdfParser.pdf_pages_list, 2022)
    await parser.start()

