# backend/routes/recommend.py

from flask import Blueprint, request, jsonify
from services.recommendation_service import recommend_portfolio  # <-- import

recommend_bp = Blueprint("recommend", __name__)

@recommend_bp.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json() or {}
    risk = data.get("risk_level", "medium")

    # Replace stub allocation with real logic:
    allocation = recommend_portfolio(risk)

    return jsonify(allocation=allocation)