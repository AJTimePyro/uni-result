def create_short_form_name(full_name: str) -> str:
    """
    It will create short form name from full name
    """

    short_name = ""
    for individual_word in full_name.split(" "):
        short_name += individual_word[0]
    return short_name