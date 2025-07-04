import os
from dotenv import load_dotenv
from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS, cross_origin
from models.base import db
from routes.auth import bp_auth
from routes.folders import bp_folder
from routes.cards import bp_card
from routes.decks import bp_deck
from services.auth_service import jwt_manager

load_dotenv()

app = Flask(__name__)
config_map = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}

# Handle None config safely
config_name = config or os.getenv("FLASK_ENV", "development")
config_class = config_map.get(config_name.lower(), DevelopmentConfig)
app.config.from_object(config_class)

# Initialize extensions
jwt_manager.init_app(app)
db.init_app(app)

if not app.config.get("TESTING"):
    migrate.init_app(app, db)

# Set up CORS
CORS(
    app,
    origins=["http://localhost:5173"],
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)

db.init_app(app)
jwt_manager.init_app(app)
migrate = Migrate(app, db)
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(folder_bp, url_prefix="/folder")
app.register_blueprint(deck_bp, url_prefix="/deck")
app.register_blueprint(card_bp, url_prefix="/card")
app.register_blueprint(review_bp, url_prefix="/review")

with app.app_context():
    db.create_all()


@app.route("/", methods=["GET", "POST"])
def index():
    return "API is running!"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)