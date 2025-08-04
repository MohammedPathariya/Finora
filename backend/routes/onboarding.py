from flask import Blueprint, request, jsonify
from services.onboarding_service import create_profile, get_profile, delete_profile

onboard_bp = Blueprint("onboard", __name__)

@onboard_bp.route("/onboard", methods=["POST"])
def onboard():
    data = request.get_json() or {}
    
    # These field names now exactly match your Supabase table columns
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
    
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    # Backend Validation
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

    # The payload is now a perfect 1-to-1 match with the database schema
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
        profile_id = create_profile(payload)
    except Exception as e:
        # This will now give a more specific error if a column is missing
        return jsonify({"error": str(e)}), 500

    return jsonify({"status": "ok", "profile_id": profile_id}), 201


# GET and DELETE routes remain the same
@onboard_bp.route("/onboard/<int:profile_id>", methods=["GET"])
def fetch_onboard(profile_id):
    profile = get_profile(profile_id)
    if not profile:
        return jsonify({"error": "Profile not found"}), 404
    return jsonify(profile)


@onboard_bp.route("/onboard/<int:profile_id>", methods=["DELETE"])
def delete_onboard(profile_id):
    success = delete_profile(profile_id)
    if not success:
        return jsonify({"error": "Profile not found or deletion failed"}), 404
    return jsonify({"status": "deleted", "profile_id": profile_id}), 200