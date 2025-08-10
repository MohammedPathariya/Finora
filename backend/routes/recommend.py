from flask import Blueprint, request, jsonify
from services.recommendation_service import generate_recommendation

recommend_bp = Blueprint("recommend", __name__)

@recommend_bp.route("/api/recommend", methods=["POST"])
def recommend():
    # This is the JSON data sent from the frontend/curl (using camelCase)
    profile_from_request = request.get_json()
    if not profile_from_request:
        return jsonify({"error": "Request body must be JSON"}), 400

    # Check that all required camelCase keys are present
    required_keys = [
        "age", "income", "investmentAmount", "timeHorizon", 
        "riskTolerance", "experience"
    ]
    if not all(key in profile_from_request for key in required_keys):
        return jsonify({"error": "Request body is missing required profile keys."}), 400

    try:
        # Create a new, clean dictionary with the snake_case keys 
        # that our Python service functions expect.
        service_profile = {
            "age": int(profile_from_request["age"]),
            "income": int(profile_from_request["income"]),
            "investment_amount": float(profile_from_request["investmentAmount"]),
            "time_horizon": str(profile_from_request["timeHorizon"]),
            "risk_tolerance": str(profile_from_request["riskTolerance"]),
            "experience": str(profile_from_request["experience"])
        }
        
        # Pass the correctly formatted profile to our service
        recommendation = generate_recommendation(service_profile)
        return jsonify(recommendation)

    except Exception as e:
        print(f"An error occurred during recommendation: {e}")
        return jsonify({"error": "An internal error occurred."}), 500