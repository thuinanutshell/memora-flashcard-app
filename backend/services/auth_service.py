from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, JWTManager, get_jwt
from datetime import timedelta
from models.user import User
from models.base import db
from sqlalchemy import or_
import redis

ACCESS_EXPIRES = timedelta(hours=24)
jwt_manager = JWTManager()


def get_redis_client():
    """Get Redis client from current app configuration"""
    from flask import current_app

    redis_url = current_app.config.get("REDIS_URL")
    return redis.from_url(redis_url, decode_responses=True)


@jwt_manager.token_in_blocklist_loader
def check_if_token_is_revoked(jwt_header, jwt_payload: dict):
    """Check if a JWT token is in the blocklist"""
    jti = jwt_payload["jti"]
    redis_client = get_redis_client()
    token_in_redis = redis_client.get(jti)
    return token_in_redis is not None


class AuthService:
    @staticmethod
    def register_user(user_data):
        required_fields = ["full_name", "username", "email", "password"]
        for field in required_fields:
            if field not in user_data or user_data[field] is None:
                raise ValueError(f"{field} is required")

        if User.query.filter_by(username=user_data["username"]).first():
            raise ValueError("Username already exists")
        elif User.query.filter_by(email=user_data["email"]).first():
            raise ValueError("Email already exists")

        new_user = User(
            full_name=user_data["full_name"],
            username=user_data["username"],
            email=user_data["email"],
            password_hash=generate_password_hash(user_data["password"]),
        )
        db.session.add(new_user)
        db.session.commit()

        access_token = create_access_token(identity=new_user.id)

        return {
            "data": {
                "id": new_user.id,
                "full_name": new_user.full_name,
                "username": new_user.username,
                "email": new_user.email,
            },
            "access_token": access_token,
        }

    @staticmethod
    def login_user(login_info):
        required_fields = ["identifier", "password"]
        for field in required_fields:
            if field not in login_info or login_info[field] is None:
                raise ValueError(f"{field} is required")

        existing_user = User.query.filter(
            or_(
                User.username == login_info["identifier"],
                User.email == login_info["identifier"],
            )
        ).first()

        if existing_user is None:
            raise ValueError("Username or email is not valid")

        if check_password_hash(existing_user.password_hash, login_info["password"]):
            access_token = create_access_token(identity=existing_user.id)
            return {
                "data": {
                    "id": existing_user.id,
                    "full_name": existing_user.full_name,
                    "username": existing_user.username,
                    "email": existing_user.email,
                },
                "access_token": access_token,
            }
        else:
            raise ValueError("Invalid password")

    @staticmethod
    def logout_user():
        jti = get_jwt()["jti"]
        redis_client = get_redis_client()
        redis_client.set(jti, "", ex=ACCESS_EXPIRES)
