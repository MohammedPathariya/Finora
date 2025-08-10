from flask import Blueprint, request, jsonify
from services.recommendation_service import generate_recommendation

recommend_bp = Blueprint("recommend", __name__)

@recommend_bp.route("/api/recommend", methods=["POST"])
def recommend():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    risk_tolerance = data.get("risk_tolerance")
    investment_amount = data.get("investment_amount")

    if not all([risk_tolerance, investment_amount]):
        return jsonify({"error": "Missing 'risk_tolerance' or 'investment_amount'"}), 400

    try:
        amount = float(investment_amount)
        if risk_tolerance not in ["conservative", "moderate", "aggressive"]:
            return jsonify({"error": "Invalid risk_tolerance value"}), 400

        # Delegate all the complex logic to our service
        recommendation = generate_recommendation(risk_tolerance, amount)
        return jsonify(recommendation)

    except (ValueError, TypeError):
        return jsonify({"error": "investment_amount must be a valid number"}), 400
    except Exception as e:
        print(f"An error occurred during recommendation: {e}")
        return jsonify({"error": "An internal error occurred."}), 500