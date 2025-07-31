from flask import Blueprint, request, jsonify
from services.onboarding_service import create_profile, get_profile

onboard_bp = Blueprint("onboard", __name__)

@onboard_bp.route("/onboard", methods=["POST"])
def onboard():
    data = request.get_json() or {}
    required = ["age", "income_range", "investment_goal", "monthly_amount", "risk_appetite"]
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    payload = {
        "age": data["age"],
        "income_range": data["income_range"],
        "investment_goal": data["investment_goal"],
        "monthly_amount": data["monthly_amount"],
        "risk_appetite": data["risk_appetite"],
    }

    try:
        profile_id = create_profile(payload)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"status": "ok", "profile_id": profile_id}), 201


@onboard_bp.route("/onboard/<int:profile_id>", methods=["GET"])
def fetch_onboard(profile_id):
    profile = get_profile(profile_id)
    if not profile:
        return jsonify({"error": "Profile not found"}), 404
    return jsonify(profile)