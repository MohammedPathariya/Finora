# backend/routes/health.py

"""
API Endpoint for Health Check.

This blueprint defines a simple '/health' route. Health check endpoints are a
standard practice in web services. They provide a straightforward way for
monitoring tools, load balancers, or container orchestrators (like Kubernetes)
to verify that the application instance is running and able to respond to
requests.
"""

from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)

@health_bp.route("/health", methods=["GET"])
def health():
    """
    Performs a basic health check of the application.

    This is the simplest form of a health check. It doesn't verify database
    connections or other dependencies; it just confirms that the Flask
    application is up and running.

    Returns:
        A JSON response with a 200 OK status code, indicating the service is healthy.
        Example:
            {
                "status": "ok",
                "service": "Finora backend"
            }
    """
    # Responds with a 200 OK status and a simple JSON payload.
    return jsonify(status="ok", service="Finora backend")