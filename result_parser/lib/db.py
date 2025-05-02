from motor.motor_asyncio import (
    AsyncIOMotorClient,
    AsyncIOMotorCollection,
    AsyncIOMotorDatabase
)
from result_parser.lib.env import ENV

mongoClient = AsyncIOMotorClient(ENV.MONGO_STR)

class DB:
    __db: AsyncIOMotorDatabase
    _uni_collec: AsyncIOMotorCollection
    _batch_collec: AsyncIOMotorCollection
    _degree_collec: AsyncIOMotorCollection
    _subject_collec: AsyncIOMotorCollection

    def __init__(self):
        self._client = mongoClient
        self.__db = self._client["uni_result"]

        self._uni_collec = self.__db["universities"]
        self._batch_collec = self.__db["batches"]
        self._degree_collec = self.__db["degrees"]
        self._subject_collec = self.__db["subjects"]
