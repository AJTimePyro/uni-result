import pymongo
import asyncio
from motor.motor_asyncio import (
    AsyncIOMotorClient,
    AsyncIOMotorCollection,
    AsyncIOMotorDatabase
)
from lib.env import ENV

mongoClient = AsyncIOMotorClient(ENV.MONGO_STR)
mongoDatabase = mongoClient["uni_result"]

class DB:
    __db: AsyncIOMotorDatabase
    _uni_collec: AsyncIOMotorCollection
    _batch_collec: AsyncIOMotorCollection
    _degree_collec: AsyncIOMotorCollection
    _college_collec: AsyncIOMotorCollection
    _subject_collec: AsyncIOMotorCollection

    def __init__(self):
        self.__db = mongoDatabase

        self._uni_collec = self.__db["universities"]
        self._batch_collec = self.__db["batches"]
        self._degree_collec = self.__db["degrees"]
        self._college_collec = self.__db["colleges"]
        self._subject_collec = self.__db["subjects"]

        asyncio.create_task(self.__required_indexing())
    
    async def __required_indexing(self):
        await self._subject_collec.create_index([
                ("subject_id", 1), ("university_id", 1)
            ], unique = True
        )
