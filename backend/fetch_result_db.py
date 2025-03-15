from lib.db import DB
from lib.customErrors import DocumentNotFound
from bson import ObjectId, errors
from backend.models import *

class Fetch_Result_DB(DB):
    def __init__(self):
        super().__init__()
    
    async def get_all_universities(self) -> list[University]:
        """
        It will get all universities
        """

        return [
            University(
                id = str(uni["_id"]),
                name = uni["name"],
                short_name = uni["short_name"]
            )
            async for uni in self._uni_collec.find(
                projection = {
                    "_id": 1,
                    "name": 1,
                    "short_name": 1
                }
            )
        ]

    async def get_university(self, id: str) -> University:
        """
        It will get university by it's id
        """

        if not ObjectId.is_valid(id):
            raise errors.InvalidId()
        
        uni = await self._uni_collec.find_one({
            "_id": ObjectId(id)
        })
        if uni:
            return University.from_mongo(uni)
        else:
            raise DocumentNotFound("University not found")
    
    async def get_batch(self, id: str) -> Batch:
        """
        It will get batch by it's id
        """

        if not ObjectId.is_valid(id):
            raise errors.InvalidId()
        
        batch = await self._batch_collec.find_one({
            "_id": ObjectId(id)
        })
        if batch:
            return Batch.from_mongo(batch)
        else:
            raise DocumentNotFound("Batch not found")
        