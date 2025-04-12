import os
import re
from urllib.parse import urlparse

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

def normalize_spacing(text: str) -> str:
    """
    It will normalize the spacing of the text by removing extra spaces and removing a space before '('
    """

    text = re.sub(r'\(', ' (', text)    # Add space before '('
    text = re.sub(r'\s+', ' ', text)    # Remove trailing spaces
    return text

def is_valid_url(url):
    """
    It will check if the url is valid
    """

    parsed = urlparse(url)
    return all([parsed.scheme, parsed.netloc])


def standardize_subject_code(code):
    """
    It will standardize the subject code
    """

    cleaned = re.sub(r'[\s\-]+', '', code.strip())
    match = re.match(r'^([A-Za-z]+)(\d+)$', cleaned)
    if match:
        prefix = match.group(1).upper()
        suffix = match.group(2)
        return f"{prefix}-{suffix}"
    return code