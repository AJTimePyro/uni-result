class OldSessionException(Exception):
    """
    Exception raised for old session year.
    """

    def __init__(self, message="Old session year is not allowed."):
        self.message = message
        super().__init__(self.message)
