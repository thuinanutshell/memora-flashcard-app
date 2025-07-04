import pytest
from models.user import User
from services.auth_service import AuthService
from models.base import db


class TestAuthService:

    def test_register_user_success(self, app, sample_user_data):
        """Test successful user registration."""
        with app.app_context():
            result = AuthService.register_user(sample_user_data)

            # Check return structure
            assert "data" in result
            assert "access_token" in result
            assert result["data"]["username"] == "testuser"
            assert result["data"]["email"] == "test@example.com"

            # Check user was created in database
            user = User.query.filter_by(username="testuser").first()
            assert user is not None
            assert user.full_name == "Test User"

    def test_register_user_duplicate_username(self, app, sample_user_data):
        """Test registration with duplicate username."""
        with app.app_context():
            # Register first user
            AuthService.register_user(sample_user_data)

            # Try to register with same username
            duplicate_data = sample_user_data.copy()
            duplicate_data["email"] = "different@example.com"

            with pytest.raises(ValueError, match="Username already exists"):
                AuthService.register_user(duplicate_data)

    def test_register_user_duplicate_email(self, app, sample_user_data):
        """Test registration with duplicate email."""
        with app.app_context():
            # Register first user
            AuthService.register_user(sample_user_data)

            # Try to register with same email
            duplicate_data = sample_user_data.copy()
            duplicate_data["username"] = "differentuser"

            with pytest.raises(ValueError, match="Email already exists"):
                AuthService.register_user(duplicate_data)

    def test_register_user_missing_fields(self, app):
        """Test registration with missing required fields."""
        with app.app_context():
            incomplete_data = {
                "username": "testuser",
                "email": "test@example.com",
                # Missing full_name and password
            }

            with pytest.raises(ValueError, match="full_name is required"):
                AuthService.register_user(incomplete_data)

    def test_login_user_success(self, app, sample_user_data):
        """Test successful user login."""
        with app.app_context():
            # Register user first
            AuthService.register_user(sample_user_data)

            # Login with username
            login_data = {"identifier": "testuser", "password": "testpassword123"}
            result = AuthService.login_user(login_data)

            assert "data" in result
            assert "access_token" in result
            assert result["data"]["username"] == "testuser"

    def test_login_user_with_email(self, app, sample_user_data):
        """Test login using email instead of username."""
        with app.app_context():
            # Register user first
            AuthService.register_user(sample_user_data)

            # Login with email
            login_data = {
                "identifier": "test@example.com",
                "password": "testpassword123",
            }
            result = AuthService.login_user(login_data)

            assert result["data"]["email"] == "test@example.com"

    def test_login_user_invalid_credentials(self, app, sample_user_data):
        """Test login with invalid credentials."""
        with app.app_context():
            # Register user first
            AuthService.register_user(sample_user_data)

            # Try login with wrong password
            login_data = {"identifier": "testuser", "password": "wrongpassword"}

            with pytest.raises(ValueError, match="Invalid password"):
                AuthService.login_user(login_data)

    def test_login_user_not_found(self, app):
        """Test login with non-existent user."""
        with app.app_context():
            login_data = {"identifier": "nonexistent", "password": "password123"}

            with pytest.raises(ValueError, match="Username or email is not valid"):
                AuthService.login_user(login_data)
