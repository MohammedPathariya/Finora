# backend/app.py

from flask import Flask
from flask_cors import CORS

from dotenv import load_dotenv
load_dotenv()

from routes.health import health_bp
from routes.recommend import recommend_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(health_bp)
app.register_blueprint(recommend_bp)

@app.route("/")
def home():
    return {"message": "Finora backend is running"}

if __name__ == "__main__":
    app.run(debug=True, port=5000)