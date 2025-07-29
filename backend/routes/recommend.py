# backend/routes/recommend.py

from flask import Blueprint, request, jsonify
from services.recommendation_service import recommend_portfolio
from services.stock_service import get_current_price

recommend_bp = Blueprint("recommend", __name__)

@recommend_bp.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json() or {}

    # 1) Parse inputs
    risk = data.get("risk_level", "medium")
    total_amount = float(data.get("investment_amount", 0))

    # 2) Get percentage allocation
    pct_alloc = recommend_portfolio(risk)

    # 3) Build detailed allocation
    detailed = {}
    for ticker, pct in pct_alloc.items():
        dollar_amt = round(total_amount * (pct / 100), 2)
        price = get_current_price(ticker)
        shares = round(dollar_amt / price, 4) if price > 0 else 0

        detailed[ticker] = {
            "percentage": pct,
            "dollar_amount": dollar_amt,
            "price": price,
            "shares": shares
        }

    return jsonify({
        "risk_level": risk,
        "investment_amount": total_amount,
        "allocation": detailed
    })