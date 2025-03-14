import pymongo
from lib.env import ENV

mongoClient = pymongo.MongoClient(ENV.MONGO_STR)
mongoDatabase = mongoClient["uni_result"]

class DB:
    __db: pymongo.database.Database
    __uni_collec: pymongo.collection.Collection
    __batch_collec: pymongo.collection.Collection
    __degree_collec: pymongo.collection.Collection
    __college_collec: pymongo.collection.Collection
    __subject_collec: pymongo.collection.Collection

    def __init__(self):
        self.__db = mongoDatabase

        self._uni_collec = self.__db["universities"]
        self._batch_collec = self.__db["batches"]
        self._degree_collec = self.__db["degrees"]
        self._college_collec = self.__db["colleges"]
        self._subject_collec = self.__db["subjects"]