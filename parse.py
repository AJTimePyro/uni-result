from result_parser.pdfDataParser.pdfParser import PDFParser
from result_parser.pdfDataParser.ipuDataParser import IPU_Result_Parser
import asyncio
import json

class Parse:
    
    def __init__(self) -> None:
        pass

    async def start(self):
        print("Select option:\
            \n1. Manual(by entering pdf path)\
            \n2. Auto(by entering json data containing pdf url)\
            \n3. Exit")
        while True:
            option = input("Enter option: ")
            if option == "1":
                await self.manual_parse()
                break
            elif option == "2":
                await self.auto_parse()
                break
            elif option == "3":
                break
            else:
                print("Invalid option")
    
    async def parse_func(self, pdf_path: str = '', pdf_url: str = ''):
        pdfParser = PDFParser(
            filePath = pdf_path,
            pdf_url = pdf_url
        )
        pdfParser.parsePdf()
        print(pdfParser.pdf_pages_list)
        # parser = IPU_Result_Parser(pdfParser.pdf_pages_list, 2022)
        # await parser.start()
    
    async def manual_parse(self):
        pdf_path = input("Enter the path to the PDF file: ")
        await self.parse_func(pdf_path)
    
    async def auto_parse(self):
        json_data = input("Enter the json file path: ")
        with open(json_data, "r") as f:
            json_content = json.load(f)
        
        for json_data in json_content:
            print(f"Parsing {json_data['title']}...")
            await self.parse_func(pdf_url = json_data["link"])
            break
        # await self.parse_func(data["pdf_url"])


if __name__ == "__main__":
    parse = Parse()
    asyncio.run(parse.start())

