import os


def create_short_form_name(full_name: str) -> str:
    """
    It will create short form name from full name
    """

    short_name = ""
    for individual_word in full_name.split(" "):
        short_name += individual_word[0]
    return short_name

def create_local_folder(folder_name: str, parent_folder_path: str):
    """
    It will create a folder in the local directory
    """

    final_folder_path = os.path.join(parent_folder_path, folder_name)
    os.makedirs(final_folder_path, exist_ok=True)
    return final_folder_path