import logging

LOG_FILE = "uni_result.log"

LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# Configure a common handler (File + Console)
file_handler = logging.FileHandler(LOG_FILE)
file_handler.setFormatter(logging.Formatter(LOG_FORMAT))

console_handler = logging.StreamHandler()
console_handler.setFormatter(logging.Formatter(LOG_FORMAT))

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
