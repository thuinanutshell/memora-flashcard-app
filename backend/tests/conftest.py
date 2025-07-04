import pytest
import tempfile
import os
from app import create_app
from models.base import db
from models.user import User
from services.auth_service import AuthService


@pytest.fixture
def app():
    """Create and configure a test app."""
    # Create temporary database
    db_fd, db_path = tempfile.mkstemp()

    app = create_app("testing")
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
    app.config["TESTING"] = True
    app.config["WTF_CSRF_ENABLED"] = False

    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture
def client(app):
    """Test client for making requests."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Test CLI runner."""
    return app.test_cli_runner()


@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        "full_name": "Test User",
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123",
    }


@pytest.fixture
def auth_headers(app, client, sample_user_data):
    """Get auth headers with valid JWT token."""
    with app.app_context():
        # Register user
        response = client.post("/auth/register", json=sample_user_data)
        print(f"Registration response status: {response.status_code}")
        print(f"Registration response data: {response.get_json()}")

        data = response.get_json()

        # Check if registration was successful
        if response.status_code != 201 or "access_token" not in data:
            pytest.fail(f"Registration failed: {data}")

        token = data["access_token"]
        return {"Authorization": f"Bearer {token}"}
