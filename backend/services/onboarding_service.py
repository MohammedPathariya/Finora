# backend/services/onboarding_service.py

import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables for Supabase credentials
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def create_profile(data: dict) -> int:
    """
    Insert an onboarding profile into Supabase and return the new record's ID.
    """
    result = supabase.table("profiles").insert(data).execute()
    try:
        return result.data[0]["id"]
    except Exception:
        raise Exception(f"Unexpected insert response: {result}")


def get_profile(profile_id: int) -> dict:
    """
    Retrieve a single profile by ID from Supabase.
    Returns the row dict or None if not found.
    """
    result = (
        supabase
        .table("profiles")
        .select("*")
        .eq("id", profile_id)
        .single()
        .execute()
    )
    return result.data if getattr(result, "data", None) else None


def delete_profile(profile_id: int) -> bool:
    """
    Delete a profile by ID from Supabase.
    Returns True if a row was deleted, False otherwise.
    """
    result = (
        supabase
        .table("profiles")
        .delete()
        .eq("id", profile_id)
        .execute()
    )
    return bool(getattr(result, "data", None))