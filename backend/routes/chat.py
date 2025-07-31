# backend/routes/chat.py

from flask import Blueprint, request, jsonify
from services.llm_service import chat_with_model

chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    user_input = data.get("message")
    if not user_input:
        return jsonify({"error": "Missing 'message' field"}), 400
    try:
        reply = chat_with_model(user_input)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"reply": reply})