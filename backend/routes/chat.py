# backend/routes/chat.py

"""
API Endpoint for the AI Chat Feature.

This blueprint defines the '/chat' route, which serves as the public-facing
HTTP interface for interacting with the AI language model. It handles incoming
POST requests, validates the input, passes the user's message to the
`llm_service`, and returns the AI's response.
"""

from flask import Blueprint, request, jsonify
from services.llm_service import chat_with_model

# A Blueprint is a way to organize a group of related views and other code.
# We register this blueprint with the main Flask app in app.py.
chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/chat", methods=["POST"])
def chat():
    """
    Handles a user's chat message.

    This function expects a POST request with a JSON body containing a 'message' key.
    It delegates the core logic of communicating with the LLM to the `chat_with_model`
    service function, following the principle of separation of concerns.

    Request JSON Body:
        {
            "message": "What is a good ETF for beginners?"
        }

    Returns:
        A JSON response containing the AI's reply, or an error message.
        On success (200):
            { "reply": "A good ETF for beginners is often..." }
        On error (400 or 500):
            { "error": "Error message details..." }
    """
    # Safely get the JSON payload from the request, defaulting to an empty dict.
    data = request.get_json() or {}
    user_input = data.get("message")

    # 1. Validate that the required 'message' field is present in the request.
    if not user_input:
        # Return a 400 Bad Request error if the message is missing.
        return jsonify({"error": "Missing 'message' field"}), 400
    
    try:
        # 2. Delegate the actual AI interaction to the service layer.
        # This keeps the route file clean and focused only on HTTP-related tasks.
        reply = chat_with_model(user_input)
    except Exception as e:
        # 3. Handle potential exceptions from the service layer (e.g., API errors from OpenAI).
        # Return a 500 Internal Server Error for unexpected issues.
        return jsonify({"error": str(e)}), 500
    
    # 4. Return the successful response to the client.
    return jsonify({"reply": reply})