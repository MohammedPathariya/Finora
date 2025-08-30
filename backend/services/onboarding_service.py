# backend/services/onboarding_service.py

"""
Service Layer for User Profile Data Management.

This module acts as the data access layer for the 'profiles' table in the
Supabase database. It encapsulates all direct database interactions (Create,
Read, Delete) for user profiles, providing a clean and abstracted interface
for the API routes.
"""

import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables from the .env file for Supabase credentials.
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize the Supabase client, which will be used for all DB operations.
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def create_profile(data: dict) -> int:
    """
    Inserts a new user profile into the database.

    Args:
        data (dict): A dictionary containing the user's profile information,
                     matching the columns of the 'profiles' table.

    Returns:
        int: The unique ID of the newly created profile record.

    Raises:
        Exception: If the database insert operation fails or returns an
                   unexpected response format.
    """
    result = supabase.table("profiles").insert(data).execute()
    try:
        # The Supabase client returns a list containing the inserted record.
        # We extract the 'id' from the first element of that list.
        return result.data[0]["id"]
    except (IndexError, TypeError):
        # This guards against unexpected API responses where `data` might be empty or malformed.
        raise Exception(f"Unexpected insert response from Supabase: {result}")


def get_profile(profile_id: int) -> dict:
    """
    Retrieves a single user profile from the database by its ID.

    Args:
        profile_id (int): The primary key of the profile to retrieve.

    Returns:
        dict or None: A dictionary representing the user's profile if found,
                      otherwise None.
    """
    result = (
        supabase
        .table("profiles")
        .select("*")
        .eq("id", profile_id)
        # The .single() method is a Supabase helper that expects exactly one row
        # in the result. It conveniently returns the object directly instead of a list.
        .single()
        .execute()
    )
    # The result's `data` attribute will be the profile dict if a record was found,
    # otherwise it will be None.
    return result.data if getattr(result, "data", None) else None


def delete_profile(profile_id: int) -> bool:
    """
    Deletes a user profile from the database by its ID.

    Args:
        profile_id (int): The primary key of the profile to delete.

    Returns:
        bool: True if a record was successfully found and deleted, False otherwise.
    """
    result = (
        supabase
        .table("profiles")
        .delete()
        .eq("id", profile_id)
        .execute()
    )
    # The Supabase delete operation returns the deleted record(s) in the `data`
    # attribute. We can cast this to a boolean to check if any records were
    # actually deleted (i.e., if the list is not empty).
    return bool(getattr(result, "data", None))