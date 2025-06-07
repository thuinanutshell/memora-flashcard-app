import pytest
import os
import sys
from pathlib import Path

# Add the project root to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))
from backend.app import app, db, jwt


@pytest.fixture(scope="module")
def test_client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        "sqlite:///:memory:"  # use in-memory database for testing
    )
    app.config["JWT_SECRET_KEY"] = "test-secret-key"

    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()


@pytest.fixture
def auth_tokens(test_client):
    # Helper to register + login a test user and return tokens
    test_client.post(
        "/auth/register",
        json={
            "full_name": "Test User",
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass",
        },
    )
    login_res = test_client.post(
        "/auth/login", json={"login": "testuser", "password": "testpass"}
    )
    return {
        "access_token": login_res.json.get("access_token"),
        "auth_header": {
            "Authorization": f'Bearer {login_res.json.get("access_token")}'
        },
    }


@pytest.fixture(autouse=True)
def rollback_after_test():
    yield
    db.session.rollback()
