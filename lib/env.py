import os
from dotenv import load_dotenv

if os.getenv('ENVIRONMENT') != 'production':
    load_dotenv('.env', override = True)
else:
    load_dotenv()

class ENV:
    # Mongo DB String, to connect with database
    MONGO_STR = os.getenv("MONGO_STR")

    # Google Drive Service Account
    GOOGLE_PROJECT_ID = os.getenv("GOOGLE_PROJECT_ID")
    GOOGLE_PRIVATE_KEY_ID = os.getenv("GOOGLE_PRIVATE_KEY_ID")
    GOOGLE_PRIVATE_KEY = os.getenv("GOOGLE_PRIVATE_KEY").replace('\\n', '\n')
    GOOGLE_CLIENT_EMAIL = os.getenv("GOOGLE_CLIENT_EMAIL")
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_CERT_URL = os.getenv("GOOGLE_CLIENT_CERT_URL")

    # Google Drive Parent Folder ID
    GOOGLE_PARENT_FOLDER_ID = os.getenv("GOOGLE_PARENT_FOLDER_ID")

    # Local Result Folder Path
    LOCAL_RESULT_FOLDER_PATH = os.getenv("LOCAL_RESULT_FOLDER_PATH")
