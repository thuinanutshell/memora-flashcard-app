import os
from dotenv import load_dotenv
from flask import Flask
from models import db

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("SQLALCHEMY_DATABASE_URI")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize database
db.init_app(app)


def reset_database():
    """Drop all tables and recreate them"""
    with app.app_context():
        print("Dropping all existing tables...")
        db.drop_all()

        print("Creating all tables...")
        db.create_all()

        print("Database reset complete!")


if __name__ == "__main__":
    reset_database()
