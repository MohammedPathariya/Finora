# backend/routes/onboarding.py

"""
API Endpoints for User Onboarding.

This blueprint handles the lifecycle of a user's profile data. It provides
RESTful endpoints to create (POST), retrieve (GET), and delete (DELETE)
user profiles. The data collected via these endpoints is the foundation for
generating personalized investment recommendations.
"""

from flask import Blueprint, request, jsonify
from services.onboarding_service import create_profile, get_profile, delete_profile

onboard_bp = Blueprint("onboard", __name__)

@onboard_bp.route("/onboard", methods=["POST"])
def onboard():
    """
    Creates a new user profile from onboarding data.

    This endpoint receives the completed user profile from the frontend form,
    performs server-side validation, and then passes the clean data to the
    onboarding service to be persisted in the database.

    Request JSON Body:
        {
            "name": "Jane Doe",
            "age": 30,
            "income_range": "$50,000 - $99,999",
            "investment_amount": 10000,
            "time_horizon": "long",
            "risk_tolerance": "moderate",
            "investment_goals": "Retirement planning, General wealth building",
            "experience": "intermediate"
        }

    Returns:
        A JSON response with the new profile's ID on success, or an error.
        On success (201 Created):
            { "status": "ok", "profile_id": 123 }
        On error (400 or 500):
            { "error": "Error message details..." }
    """
    data = request.get_json() or {}
    
    # Define all fields required by the database table.
    required = [
        "name",
        "age",
        "income_range",
        "investment_amount",
        "time_horizon",
        "risk_tolerance",
        "investment_goals",
        "experience",
    ]
    
    # 1. First-pass validation: ensure all required fields are present in the request.
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    # 2. Second-pass validation: check data types and business rules for key fields.
    # This is a crucial security and data integrity step.
    try:
        name = str(data["name"])
        age = int(data["age"])
        amount = int(data["investment_amount"])

        if not name.strip():
            return jsonify({"error": "Name cannot be empty."}), 400
        if not 18 <= age <= 100:
            return jsonify({"error": "Age must be between 18 and 100."}), 400
        if amount <= 0:
            return jsonify({"error": "Investment amount must be a positive number."}), 400

    except (ValueError, TypeError):
        return jsonify({"error": "Age and investment amount must be valid numbers."}), 400

    # 3. Assemble a clean payload dictionary. This ensures no unexpected fields
    # are passed to the service layer.
    payload = {
        "name": name,
        "age": age,
        "income_range": data["income_range"],
        "investment_amount": amount,
        "time_horizon": data["time_horizon"],
        "risk_tolerance": data["risk_tolerance"],
        "investment_goals": data["investment_goals"],
        "experience": data["experience"],
    }

    try:
        # 4. Delegate database insertion to the service layer.
        profile_id = create_profile(payload)
    except Exception as e:
        # Handle potential database errors passed up from the service.
        return jsonify({"error": str(e)}), 500

    # On successful creation, return a 201 Created status code, which is the
    # correct HTTP standard for a POST request that creates a new resource.
    return jsonify({"status": "ok", "profile_id": profile_id}), 201


@onboard_bp.route("/onboard/<int:profile_id>", methods=["GET"])
def fetch_onboard(profile_id):
    """
    Retrieves a user profile by its ID.

    Args:
        profile_id (int): The unique identifier for the user profile,
                          passed in the URL.

    Returns:
        A JSON response containing the full profile data or a 404 error if not found.
    """
    profile = get_profile(profile_id)
    if not profile:
        return jsonify({"error": "Profile not found"}), 404
    return jsonify(profile)


@onboard_bp.route("/onboard/<int:profile_id>", methods=["DELETE"])
def delete_onboard(profile_id):
    """
    Deletes a user profile by its ID.

    Args:
        profile_id (int): The unique identifier for the user profile,
                          passed in the URL.

    Returns:
        A JSON response confirming deletion or a 404 error if not found.
    """
    success = delete_profile(profile_id)
    if not success:
        return jsonify({"error": "Profile not found or deletion failed"}), 404
    return jsonify({"status": "deleted", "profile_id": profile_id}), 200