import pymongo

class mongoDB:
    def __init__(self):
        self.client = pymongo.MongoClient("")
        self.db = self.client["mydatabase"]
        self.collection = self.db["mycollection"]