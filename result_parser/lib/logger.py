import logging
import os
from result_parser.lib.env import ENV

LOG_FILE = os.path.join(ENV.LOG_FOLDER_PATH, "uni_result.log")

if not os.path.exists(ENV.LOG_FOLDER_PATH):
    os.makedirs(ENV.LOG_FOLDER_PATH)

LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

# Configure a common handler (File + Console)
file_handler = logging.FileHandler(LOG_FILE)
file_handler.setFormatter(logging.Formatter(LOG_FORMAT, DATE_FORMAT))

console_handler = logging.StreamHandler()
console_handler.setFormatter(logging.Formatter(LOG_FORMAT, DATE_FORMAT))

# Configure a logger instance
def get_logger(name: str):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    return logger

# Create a logger instance for the parser
parser_logger = get_logger("parser")

# Create a logger instance for the result_db
result_db_logger = get_logger("result_db")

# Create a logger instance for the gdrive
gdrive_logger = get_logger("gdrive")
