import os
from lib.env import ENV
from lib.utils import create_local_folder
from lib.logger import gdrive_logger
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SERVICE_ACCOUNT_INFO = {
    "type": "service_account",
    "project_id": ENV.GOOGLE_PROJECT_ID,
    "private_key_id": ENV.GOOGLE_PRIVATE_KEY_ID,
    "private_key": ENV.GOOGLE_PRIVATE_KEY,
    "client_email": ENV.GOOGLE_CLIENT_EMAIL,
    "client_id": ENV.GOOGLE_CLIENT_ID,
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": ENV.GOOGLE_CLIENT_CERT_URL
}

SCOPES = ['https://www.googleapis.com/auth/drive.file']

class GDrive:
    __drive: any

    def __init__(self):
        self.__connect_to_drive()
        self.__parent_folder_id = ENV.GOOGLE_PARENT_FOLDER_ID

    def __connect_to_drive(self):
        """
        It will connect to google drive
        """

        credentials = Credentials.from_service_account_info(
            SERVICE_ACCOUNT_INFO,
            scopes = SCOPES
        )
        self.__drive = build(
            'drive',
            'v3',
            credentials = credentials
        )
    
    def __create_folder(
        self,
        folder_name: str,
        parent_folder_id: str
    ) -> str:
        """
        It will create a folder in google drive inside a parent folder and return the folder id of created folder
        """

        file_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': [parent_folder_id]
        }
            
        folder = self.__drive.files().create(
            body = file_metadata,
            fields = 'id'
        ).execute()
        
        return folder.get('id')
    
    def __get_file_id(
        self,
        file_name: str,
        folder_id: str
    ) -> str | None:
        """
        It will get the file id of a file in a given folder
        """
        
        # Search for file in the specified folder
        results = self.__drive.files().list(
            q = f"name='{file_name}' and '{folder_id}' in parents",
            spaces = 'drive',
            fields = 'files(id)'
        ).execute()

        files = results.get('files', [])
        
        if files:
            # Return id of first matching file
            return files[0].get('id')
        return None
    
    def __get_folder_id(
        self,
        folder_name: str,
        parent_folder_id: str
    ) -> str | None:
        """
        It will get the folder id if it exists in the parent folder
        """

        results = self.__drive.files().list(
            q = f"name='{folder_name}' and '{parent_folder_id}' in parents and mimeType='application/vnd.google-apps.folder'",
            spaces = 'drive',
            fields = 'files(id)'
        ).execute()

        files = results.get('files', [])
        return files[0].get('id') if files else None

    def upload_file(
        self,
        file_path: str,
        folder_id: str
    ) -> str:
        """
        It will upload the file to google drive, inside a given folder and return the file id
        """

        file_name = file_path.split('/')[-1]
        gdrive_logger.info(f"Uploading result to drive...")

        media = MediaFileUpload(
            file_path,
            resumable = True
        )
        file = self.__drive.files().create(
            body = {
                'name': file_name,
                'parents': [folder_id]
            },
            media_body = media,
            fields = 'id'
        ).execute()

        gdrive_logger.info(f"Result uploaded to drive successfully")
        return file.get('id')

    def create_folder_inside_parent_dir(self, new_folder_name: str) -> str:
        """
        It will return existing folder id if folder exists, otherwise create a new folder
        and return its id
        """
        existing_folder_id = self.__get_folder_id(new_folder_name, self.__parent_folder_id)
        if existing_folder_id:
            return existing_folder_id

        folder_id = self.__create_folder(new_folder_name, self.__parent_folder_id)
        create_local_folder(new_folder_name, ENV.LOCAL_RESULT_FOLDER_PATH)
        return folder_id
    
    def create_folder_inside_given_dir(
        self,
        new_folder_name: str,
        parent_folder_id: str,
        relative_local_folder_path: str
    ):
        """
        It will create a folder in google drive inside a given folder and return the folder id
        """

        existing_folder_id = self.__get_folder_id(new_folder_name, parent_folder_id)
        if existing_folder_id:
            return existing_folder_id

        folder_id = self.__create_folder(new_folder_name, parent_folder_id)
        create_local_folder(
            new_folder_name,
            os.path.join(
                ENV.LOCAL_RESULT_FOLDER_PATH,
                relative_local_folder_path
            )
        )
        
        return folder_id
    
    def update_existing_file(
        self,
        folder_id: str,
        updated_file_path: str
    ):
        """
        It will update the existing file in google drive
        """

        file_name = updated_file_path.split('/')[-1]
        gdrive_logger.info(f"Updating existing result in drive...")
        file_id = self.__get_file_id(file_name, folder_id)
        if file_id:
            media = MediaFileUpload(
                updated_file_path,
                mimetype = "text/csv",
                resumable = True
            )
            self.__drive.files().update(
                fileId = file_id,
                media_body = media
            ).execute()
            gdrive_logger.info(f"Result updated in drive successfully")
            
        else:
            gdrive_logger.error(f"File {file_name} not found in folder {folder_id}")
            raise FileNotFoundError(f"File {file_name} not found in folder {folder_id}")
            