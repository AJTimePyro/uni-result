from lib.db import DB

class Fetch_Result_DB(DB):
    def __init__(self):
        super().__init__()
    
    def get_batch(
        self,
        university_id: str
    ):
        """
        It will get all the batches of a university
        """

        univ = self._uni_collec.find_one({
            "_id": university_id
        })
        return univ
        # self._batch_collec.find()
        
