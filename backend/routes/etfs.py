from flask import Blueprint, jsonify
from services.etf_service import get_top_etfs

etfs_bp = Blueprint("etfs", __name__)

@etfs_bp.route("/etfs", methods=["GET"])
def list_etfs():
    return jsonify(get_top_etfs())