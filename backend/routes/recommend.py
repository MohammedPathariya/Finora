from flask import Blueprint, request, jsonify
from services.recommendation_service import generate_recommendation
from services.projection_service import run_monte_carlo_simulation # 1. Import the projection service

recommend_bp = Blueprint("recommend", __name__)

@recommend_bp.route("/api/recommend", methods=["POST"])
def recommend():
    profile_from_request = request.get_json()
    if not profile_from_request:
        return jsonify({"error": "Request body must be JSON"}), 400

    required_keys = ["age", "income", "investmentAmount", "timeHorizon", "riskTolerance", "experience"]
    if not all(key in profile_from_request for key in required_keys):
        return jsonify({"error": "Request body is missing required profile keys."}), 400

    try:
        service_profile = {
            "age": int(profile_from_request["age"]),
            "income": int(profile_from_request["income"]),
            "investment_amount": float(profile_from_request["investmentAmount"]),
            "time_horizon": str(profile_from_request["timeHorizon"]),
            "risk_tolerance": str(profile_from_request["riskTolerance"]),
            "experience": str(profile_from_request["experience"])
        }
        
        # 2. First, generate the core recommendation
        recommendation = generate_recommendation(service_profile)
        
        # 3. Then, immediately run projections on that new portfolio
        projections = run_monte_carlo_simulation(
            portfolio=recommendation["recommended_portfolio"],
            initial_investment=service_profile["investment_amount"]
        )
        
        # 4. Combine both results into a single response
        final_response = {**recommendation, "projections": projections}
        
        return jsonify(final_response)

    except Exception as e:
        print(f"An error occurred during recommendation: {e}")
        return jsonify({"error": "An internal error occurred."}), 500