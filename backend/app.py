# backend/app.py

"""
Main Entry Point for the Finora Flask Application.

This file is responsible for initializing, configuring, and running the Flask web server.
It performs the following key functions:
- Loads environment variables from the .env file.
- Creates the core Flask application instance.
- Configures Cross-Origin Resource Sharing (CORS) to allow the frontend to communicate with it.
- Imports and registers all the API endpoint blueprints from the 'routes' directory.
- Defines a simple root route ("/") for basic status checks.
- Starts the development server when the script is executed directly.
"""

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables (e.g., SUPABASE_URL, OPENAI_API_KEY) from the .env file.
# This must be done before any other application modules are imported, as they may
# depend on these variables during their own initialization.
load_dotenv()

# Import the blueprint objects from their respective route files.
from routes.health import health_bp
from routes.onboarding import onboard_bp
from routes.chat import chat_bp
from routes.etfs import etfs_bp
from routes.recommend import recommend_bp

# Create the main Flask application instance.
app = Flask(__name__)

# Enable CORS for the entire application. This is crucial for allowing the
# React frontend (running on a different domain/port during development)
# to make API requests to this backend.
CORS(app)

# Register all the imported blueprints with the Flask app.
# This connects the routes defined in each blueprint (e.g., /health, /chat)
# to the main application, making them accessible via HTTP requests.
app.register_blueprint(health_bp)
app.register_blueprint(onboard_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(etfs_bp)
app.register_blueprint(recommend_bp)

@app.route("/")
def home():
    """Defines the root route, which provides a simple status message."""
    return {"message": "Finora backend is running"}

# This standard Python construct ensures that the Flask development server is only
# run when the script is executed directly (e.g., `python app.py`).
# It will not run if the 'app' object is imported by another script.
if __name__ == "__main__":
    app.run(debug=True, port=5000)