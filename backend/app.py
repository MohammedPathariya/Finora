# backend/app.py

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Load .env (SUPABASE_URL, SUPABASE_KEY, ALPHA_VANTAGE_KEY, etc.)
load_dotenv()

from routes.health import health_bp
from routes.recommend import recommend_bp
from routes.onboarding import onboard_bp
from routes.chat import chat_bp
from routes.etfs import etfs_bp

app = Flask(__name__)
CORS(app)

# Existing endpoints
app.register_blueprint(health_bp)
app.register_blueprint(recommend_bp)
app.register_blueprint(onboard_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(etfs_bp)

@app.route("/")
def home():
    return {"message": "Finora backend is running"}

if __name__ == "__main__":
    app.run(debug=True, port=5000)