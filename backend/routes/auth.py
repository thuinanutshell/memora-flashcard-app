from flask import Blueprint, jsonify, request
from services.auth_service import AuthService
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.base import db
from models.user import User

bp_auth = Blueprint("auth", __name__)


@bp_auth.route("/register", methods=["POST"])
def register():
    try:
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400

        # Get data from the user's request
        user_data = request.get_json()
        if user_data is None:
            return jsonify({"error": "Request body must contain valid JSON"}), 400

        result = AuthService.register_user(user_data)
        return jsonify("message": "User registered successfully", 
                       "data": result["data"],
                       "access_token": result["access_token"]), 201

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal server error"}), 500


@bp_auth.route("/login", methods=["POST"])
def login():
    try:
        # Check if request has JSON content type first
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400

        # Get data from the user's request
        login_data = request.get_json()
        if login_data is None:
            return jsonify({"error": "Request body must contain valid JSON"}), 400

        result = AuthService.login_user(login_data)
        return jsonify("message": "User logged in successfully", 
                       "data": result["data"],
                       "access_token": result["access_token"]), 200

    except ValueError as e:
        # Handle validation errors from service
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500


@bp_auth.route("/logout", methods=["DELETE"])
@jwt_required()
def logout():
    """Logout user by adding token to blocklist"""
    try:
        AuthService.logout_user()
        return jsonify({"message": "Access token revoked"}), 200
    except Exception as e:
        return jsonify({"error": "Logout failed"}), 500


@bp_auth.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        return jsonify({
            "message": "Retrieved current user successfully",
            "data": {
                "id": user.id,
                "full_name": user.full_name,
                "username": user.username,
                "email": user.email
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": "Failed to get user info"}), 500