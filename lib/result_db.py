import pymongo
from lib.env import ENV
from lib.utils import create_short_form_name

class Result_DB:
    __client : pymongo.MongoClient
    __db: pymongo.database.Database
    __uni_collec: pymongo.collection.Collection

    def __init__(self, university_name: str = ''):
        self.__client = pymongo.MongoClient(ENV.MONGO_STR)
        self.__db = self.__client["uni_result"]
        self.__uni_collec = self.__db["universities"]

        if university_name:
            self.connect_to_university(university_name)
    
    def connect_to_university(self, university_name: str, short_name: str = ''):
        """
        It will find university by name. If not found, it will create one. Note: university_name should be a full name
        """
        
        short_name = short_name or create_short_form_name(university_name)
        self.__uni_document = self.__uni_collec.find_one_and_update({
                "name": university_name
            }, {
                "$setOnInsert": {
                    "name": university_name,
                    "short_name": short_name
                }
            }, upsert = True,
            return_document = pymongo.ReturnDocument.AFTER
        )
    