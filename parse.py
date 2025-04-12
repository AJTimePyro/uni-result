from result_parser.pdfDataParser.pdfParser import PDFParser
from result_parser.pdfDataParser.ipuDataParser import IPU_Result_Parser
from result_parser.lib.logger import automation_logger
from result_parser.lib.env import ENV
import asyncio
import json
import os
import time
import traceback

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
    
    async def parse_func(self, pdf_path: str = '', pdf_url: str = '', page_num : int = 1):
        pdfParser = PDFParser(
            filePath = pdf_path,
            pdf_url = pdf_url
        )
        pdfParser.parsePdf()
        if not pdfParser.pdf_pages_list or len(pdfParser.pdf_pages_list) <= 1:
            automation_logger.error(f"No enough content found in pdf {pdf_path if pdf_path else pdf_url}")
            return
        
        parser = IPU_Result_Parser(
            pdfParser.pdf_pages_list,
            2020,
            page_to_start = page_num
        )
        await parser.start()
    
    async def manual_parse(self):
        pdf_path = input("Enter the path to the PDF file: ")
        pdf_page_num = input("Enter the page number to start from(default 1): ")
        try:
            if not pdf_page_num:
                pdf_page_num = 1
            else:
                pdf_page_num = int(pdf_page_num)
        except ValueError:
            automation_logger.error("Invalid page number")
            return
        await self.parse_func(pdf_path, page_num = pdf_page_num)
    
    async def auto_parse(self):
        json_data = input("Enter the json file path: ")
        with open(json_data, "r") as f:
            json_content = json.load(f)
        
        if not json_content:
            automation_logger.error("Json file is empty")
            return
        elif not isinstance(json_content, list):
            automation_logger.error("Json file is not a list")
            return
        
        input_index = input("Enter the index of the file to start from(default empty): ")
        try:
            if not input_index:
                input_index = 0
            else:
                input_index = int(input_index)
        except ValueError:
            automation_logger.error("Invalid index")
            return
        
        error_json_path = os.path.join(ENV.LOG_FOLDER_PATH, "error_parsing.json")
        if os.path.isfile(error_json_path):
            with open(error_json_path, "r") as f:
                error_json_content = json.load(f)
        else:
            with open(error_json_path, "w") as f:
                json.dump([], f)

        for json_data in json_content[input_index:]:
            startTime = time.time()
            print(f"Parsing file index no. {input_index} {json_data['title']}...")
            try:
                await self.parse_func(pdf_url=json_data["link"])
            except Exception as err:
                error_message = {
                    "title": json_data['title'],
                    "link": json_data['link'],
                    "error": str(err),
                    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
                }
                automation_logger.error(f"Error while parsing pdf file index no. {input_index}, pdf name: {json_data['title']}", exc_info=True)
                traceback.print_exc()
                error_json_content.append(error_message)
                with open(error_json_path, "w") as f:
                    json.dump(error_json_content, f, indent=4)
                return
            else:
                endTime = time.time()
                automation_logger.info(f"Successfully parsed pdf file index no. {input_index}, pdf name: {json_data['title']}, pdf link: {json_data['link']}, time taken: {endTime - startTime} seconds")
            input_index += 1

if __name__ == "__main__":
    parse = Parse()
    asyncio.run(parse.start())

