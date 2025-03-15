from lib.db import DB
from lib.customErrors import DocumentNotFound
from bson import ObjectId, errors
from backend.models import Batch

class Fetch_Result_DB(DB):
    def __init__(self):
        super().__init__()
    
    async def get_batch(
        self,
        id: str
    ) -> Batch | None:
        """
        It will get all the batches of a university
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
        