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
        }, {
            "folder_id": 0
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
        }, {
            "folder_id": 0
        })
        if batch:
            degree_list = batch["degrees"]
            batch["degrees"] = await self.__get_all_degrees(list(degree_list.values()))
            return Batch.from_mongo(batch)
        else:
            raise DocumentNotFound("Batch not found")
    
    async def get_degree(self, id: str, return_subjects = False, return_colleges = False) -> Degree:
        """
        It will get degree by it's id
        """

        if not ObjectId.is_valid(id):
            raise errors.InvalidId()
        
        projection = {
            "folder_id": 0
        }
        if not return_subjects:
            projection["subjects"] = 0
        if not return_colleges:
            projection["colleges"] = 0
        
        degree = await self._degree_collec.find_one(
            { "_id": ObjectId(id) },
            projection
        )
        if degree:
            return Degree.from_mongo(degree)
        else:
            raise DocumentNotFound("Degree not found")

    async def get_all_subjects_by_doc_id(
        self,
        doc_id_list: list[str]
    ) -> list[Subject]:
        """
        It will get all subjects details by it's ids
        """

        # university = await self.__get_university_by_name(university_name)
        return [
            Subject.from_mongo(subject)
            async for subject in self._subject_collec.find(
                { "_id": { "$in": doc_id_list } },
                { "university_id": 0 }
            )
        ]

    async def __get_all_degrees(self, degree_id_list: list[str]) -> list[Degree]:
        return await self._degree_collec.aggregate([{
                "$match": {
                    "_id": {"$in": degree_id_list}
                }
            }, {
                "$group": {
                    "_id": "$degree_name",
                    "branches": {
                        "$push": {
                            "$arrayToObject": [[
                                {"k": "$branch_name", "v": "$_id"}
                            ]]
                        }
                    }
                }
            }, {
                "$project": {
                    "_id": 0,
                    "degree_name": "$_id",
                    "branches": 1
                }
            }
        ]).to_list(length=None)
    
    # async def __get_university_by_name(self, university_name: str) -> University:
    #     university = await self._uni_collec.find_one({
    #         "name": university_name
    #     })
    #     return University.from_mongo(university)
