from flask import Blueprint, request, jsonify
from sqlalchemy import or_
from flask_jwt_extended import (
    create_access_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
    JWTManager,
)
from werkzeug.security import generate_password_hash, check_password_hash
from backend.models import db, User

# Initialize JSON Web Token Manager
jwt = JWTManager()

# Set up a blacklisted tokens to log out user
blacklisted_tokens = set()
auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """Logic to create a new user

    JSON Object Data:
        - full_name (str)
        - username (str)
        - email (str)
        - password (str)
    """
    data = request.get_json()
    full_name = data.get("full_name")
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    # Create a hashed version for user's plain string password
    password_hash = generate_password_hash(password)

    # Check if username or email already exist in the database
    if User.query.filter(or_(User.username == username, User.email == email)).first():
        return jsonify({"error": "Username or email already exists."}), 409

    # If username and email are unique, add new user to the database
    new_user = User(
        full_name=full_name, username=username, email=email, password_hash=password_hash
    )
    db.session.add(new_user)
    db.session.commit()
    return (
        jsonify(
            {
                "message": "New user created",
                "user": {
                    "id": new_user.id,
                    "full_name": new_user.full_name,
                    "username": new_user.username,
                    "email": new_user.email,
                },
            }
        ),
        201,
    )


@auth_bp.route("/login", methods=["POST"])
def login():
    """Logic to log in a user

    JSON Object Data:
        - login (str): can either be email or username
        - password (str): user's plain string password
    """
    data = request.get_json()
    login = data.get("login")
    password = data.get("password")

    # Check if the user already exists in the database
    user = User.query.filter(or_(User.username == login, User.email == login)).first()

    # Check if the password input matches that in the database
    if user and check_password_hash(user.password_hash, password):
        # Create an access token based on user's id
        access_token = create_access_token(identity=user.id)
        return (
            jsonify(
                {
                    "message": "Login successful",
                    "access_token": access_token,
                    "user_id": user.id,
                }
            ),
            200,
        )

    return jsonify({"error": "Invalid credentials"}), 400


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]  # JWT unique identifier
    blacklisted_tokens.add(jti)
    return jsonify({"message": f"Access token revoked for user {jti}"}), 200


@auth_bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    jti = get_jwt()["jti"]
    if jti in blacklisted_tokens:
        return jsonify({"message": "Token has been revoked"}), 401
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)
    return jsonify({"id": user.id, "username": user.username}), 200
