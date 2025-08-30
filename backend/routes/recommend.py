# backend/routes/recommend.py

"""
Core API Endpoint for Generating Investment Recommendations.

This blueprint defines the '/api/recommend' route, which is the central "engine"
of the Finora application. It takes a user's complete financial profile and
orchestrates calls to the recommendation and projection services to generate
a full, personalized investment plan.
"""

from flask import Blueprint, request, jsonify
from services.recommendation_service import generate_recommendation
from services.projection_service import run_monte_carlo_simulation

recommend_bp = Blueprint("recommend", __name__)

@recommend_bp.route("/api/recommend", methods=["POST"])
def recommend():
    """
    Generates a personalized investment portfolio and growth projections.

    This endpoint is the heart of the application. It receives a user's profile,
    validates it, and then calls two key services in sequence:
    1. `generate_recommendation`: Creates a tailored ETF portfolio.
    2. `run_monte_carlo_simulation`: Projects the long-term growth of that portfolio.

    The results are combined into a single, comprehensive response for the client.

    Request JSON Body (camelCase keys from frontend):
        {
            "age": 30,
            "income": 75000,
            "investmentAmount": 10000,
            "timeHorizon": "long",
            "riskTolerance": "moderate",
            "experience": "intermediate"
        }

    Returns:
        A JSON object containing the full investment plan, or an error.
        On success (200):
            {
                "nuanced_risk_score": 7.5,
                "risk_tolerance_original": "moderate",
                "expected_annual_return": 8.5,
                "recommended_portfolio": [ ... list of ETF objects ... ],
                "projections": [ ... list of yearly projection objects ... ]
            }
        On error (400 or 500):
            { "error": "Error message details..." }
    """
    profile_from_request = request.get_json()
    if not profile_from_request:
        return jsonify({"error": "Request body must be JSON"}), 400

    # 1. Validate the incoming request to ensure all necessary data is present.
    required_keys = ["age", "income", "investmentAmount", "timeHorizon", "riskTolerance", "experience"]
    if not all(key in profile_from_request for key in required_keys):
        return jsonify({"error": "Request body is missing required profile keys."}), 400

    try:
        # 2. Sanitize and structure the input data for the service layer.
        # Note the transformation from the frontend's camelCase (e.g., investmentAmount)
        # to the snake_case expected by the Python services.
        service_profile = {
            "age": int(profile_from_request["age"]),
            "income": int(profile_from_request["income"]),
            "investment_amount": float(profile_from_request["investmentAmount"]),
            "time_horizon": str(profile_from_request["timeHorizon"]),
            "risk_tolerance": str(profile_from_request["riskTolerance"]),
            "experience": str(profile_from_request["experience"])
        }
        
        # 3. First, generate the core ETF portfolio recommendation.
        recommendation = generate_recommendation(service_profile)
        
        # 4. Immediately use that new portfolio to run the long-term growth simulation.
        projections = run_monte_carlo_simulation(
            portfolio=recommendation["recommended_portfolio"],
            initial_investment=service_profile["investment_amount"]
        )
        
        # 5. Combine both results into a single response object. This is highly
        # efficient as it provides all necessary dashboard data in one client network request.
        final_response = {**recommendation, "projections": projections}
        
        return jsonify(final_response)

    except Exception as e:
        # A broad exception handler is used here because the underlying services
        # (recommendation, projection) can have complex, multi-step failures.
        print(f"An error occurred during recommendation: {e}")
        return jsonify({"error": "An internal error occurred."}), 500