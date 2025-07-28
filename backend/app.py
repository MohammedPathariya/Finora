from flask import Flask
from flask_cors import CORS
from backend.routes.recommendation_service import recommend_bp

app = Flask(__name__)
CORS(app)

# after app = Flask(...) and CORS(app):
app.register_blueprint(recommend_bp)

@app.route("/")
def home():
    return {"message": "Finora backend is running"}

if __name__ == "__main__":
    app.run(debug=True, port=5000)