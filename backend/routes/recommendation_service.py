# routes/recommend.py

from flask import Blueprint, request, jsonify

recommend_bp = Blueprint("recommend", __name__)

@recommend_bp.route("/recommend", methods=["POST"])
def recommend():
    # Pull in the JSON body (we’ll validate later)
    data = request.get_json() or {}

    # Stub response: echo back what we got plus a fake allocation
    return jsonify({
        "received": data,
        "allocation": {
            "VTI": 50,
            "BND": 30,
            "QQQ": 20
        }
    })