import os
from dotenv import load_dotenv
from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS
from models import db, User, Folder, Deck, Card, Review, AIConversation
from config import DevelopmentConfig, TestingConfig, ProductionConfig
from routes.auth import bp_auth
from routes.folders import bp_folder
from routes.cards import card_bp
from routes.decks import bp_deck
from routes.analytics import bp_analytics
from services.auth_service import jwt_manager

load_dotenv()


def create_app(config_name=None):
    app = Flask(__name__)

    config_map = {
        "development": DevelopmentConfig,
        "testing": TestingConfig,
        "production": ProductionConfig,
    }

    # Handle config selection properly
    config_name = config_name or os.getenv("FLASK_ENV", "development")
    config_class = config_map.get(config_name.lower(), DevelopmentConfig)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt_manager.init_app(app)

    # Only initialize migrate for non-testing environments
    if not app.config.get("TESTING"):
        migrate = Migrate(app, db)

    # Set up CORS
    CORS(
        app,
        origins=["http://localhost:5173"],
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    # Register blueprints with correct names
    app.register_blueprint(bp_auth, url_prefix="/auth")
    app.register_blueprint(bp_folder, url_prefix="/folder")
    app.register_blueprint(bp_deck, url_prefix="/deck")
    app.register_blueprint(card_bp, url_prefix="/card")
    app.register_blueprint(bp_analytics, url_prefix="/analytics")

    # Create tables in app context
    with app.app_context():
        db.create_all()

    @app.route("/", methods=["GET"])
    def index():
        return {"message": "API is running!"}

    return app


# For development
app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
