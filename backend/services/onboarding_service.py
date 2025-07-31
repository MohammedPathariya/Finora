import os
from supabase import create_client
from dotenv import load_dotenv

# Load .env so SUPABASE_URL and SUPABASE_KEY are available
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def create_profile(data: dict) -> int:
    """
    Insert an onboarding profile into Supabase and return the new record's ID.
    Expects `data` keys to match your `profiles` table columns.
    """
    try:
        result = supabase.table("profiles").insert(data).execute()
    except Exception as exc:
        raise Exception(f"Supabase insert failed: {exc}")

    # The `result.data` should be a list of inserted rows
    try:
        new_id = result.data[0]["id"]
    except Exception:
        raise Exception(f"Unexpected Supabase response format: {result}")

    return new_id


def get_profile(profile_id: int) -> dict:
    """
    Retrieve a single profile by ID from Supabase.
    Returns the row dict or None if not found.
    """
    try:
        result = (
            supabase
            .table("profiles")
            .select("*")
            .eq("id", profile_id)
            .single()
            .execute()
        )
    except Exception as exc:
        # Could log exc here
        return None

    # If nothing was returned, data will be None or empty
    if not getattr(result, "data", None):
        return None

    return result.data