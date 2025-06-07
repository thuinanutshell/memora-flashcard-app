import os
from dotenv import load_dotenv
from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS, cross_origin
from backend.models import db
from backend.blueprints.bp_auth import auth_bp, jwt
from backend.blueprints.bp_folder import folder_bp
from backend.blueprints.bp_card import card_bp
from backend.blueprints.bp_deck import deck_bp
from backend.blueprints.bp_review import review_bp


load_dotenv()

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("SQLALCHEMY_DATABASE_URI")

# Set up CORS
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

db.init_app(app)
jwt.init_app(app)
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
