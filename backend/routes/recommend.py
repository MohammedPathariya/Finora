# backend/routes/recommend.py

from flask import Blueprint, request, jsonify
from services.recommendation_service import recommend_portfolio

recommend_bp = Blueprint("recommend", __name__)

@recommend_bp.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json() or {}

    # 1) Parse inputs
    risk = data.get("risk_level", "medium")
    total_amount = float(data.get("investment_amount", 0))

    # 2) Delegate recommendation logic to service
    result = recommend_portfolio(risk, total_amount)

    # 3) Return full recommendation payload as JSON
    return jsonify(result)