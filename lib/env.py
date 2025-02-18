import os
from dotenv import load_dotenv

load_dotenv()

class ENV:
    # Mongo DB String, to connect with database
    MONGO_STR = os.getenv("MONGO_STR")
