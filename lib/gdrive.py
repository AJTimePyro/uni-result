from lib.env import ENV
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

SERVICE_ACCOUNT_INFO = {
    "type": "service_account",
    "project_id": ENV.GOOGLE_PROJECT_ID,
    "private_key_id": ENV.GOOGLE_PRIVATE_KEY_ID,
    "private_key": ENV.GOOGLE_PRIVATE_KEY.replace('\\n', '\n'),
    "client_email": ENV.GOOGLE_CLIENT_EMAIL,
    "client_id": ENV.GOOGLE_CLIENT_ID,
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": ENV.GOOGLE_CLIENT_X509_CERT_URL
}

SCOPES = ['https://www.googleapis.com/auth/drive']

class GDrive:
    __drive: any

    def __init__(self):
        self.__connect_to_drive()
        self.__parent_folder_id = ENV.GOOGLE_PARENT_FOLDER_ID

    def __connect_to_drive(self):
        credentials = Credentials.from_service_account_info(
            SERVICE_ACCOUNT_INFO,
            scopes = SCOPES
        )
        self.__drive = build(
            'drive',
            'v3',
            credentials = credentials
        )
