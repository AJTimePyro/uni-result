from lib.db import DB
from bson import ObjectId

class Fetch_Result_DB(DB):
    def __init__(self):
        super().__init__()
    
    async def get_batch(
        self,
        university_id: str
    ):
        """
        It will get all the batches of a university
        """

        univ = await self._uni_collec.find_one({
            "_id": ObjectId(university_id)
        })
        return univ
        # self._batch_collec.find()
        
