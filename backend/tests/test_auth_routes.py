import pytest
import json


class TestAuthRoutes:

    def test_register_route_success(self, client, sample_user_data):
        """Test /auth/register endpoint success."""
        response = client.post(
            "/auth/register",
            data=json.dumps(sample_user_data),
            content_type="application/json",
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data["message"] == "User registered successfully"
        assert "access_token" in data
        assert data["data"]["username"] == "testuser"

    def test_register_route_invalid_json(self, client):
        """Test /auth/register with invalid JSON."""
        response = client.post(
            "/auth/register", data="invalid json", content_type="application/json"
        )

        assert response.status_code == 400
        data = response.get_json()
        assert "error" in data

    def test_register_route_missing_json(self, client):
        """Test /auth/register without JSON content type."""
        response = client.post("/auth/register", data="some data")

        assert response.status_code == 400
        data = response.get_json()
        assert data["error"] == "Request must be JSON"

    def test_login_route_success(self, client, sample_user_data):
        """Test /auth/login endpoint success."""
        # Register user first
        client.post(
            "/auth/register",
            data=json.dumps(sample_user_data),
            content_type="application/json",
        )

        # Login
        login_data = {"identifier": "testuser", "password": "testpassword123"}
        response = client.post(
            "/auth/login", data=json.dumps(login_data), content_type="application/json"
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data["message"] == "User logged in successfully"
        assert "access_token" in data

    def test_login_route_invalid_credentials(self, client, sample_user_data):
        """Test /auth/login with wrong password."""
        # Register user first
        client.post(
            "/auth/register",
            data=json.dumps(sample_user_data),
            content_type="application/json",
        )

        # Try login with wrong password
        login_data = {"identifier": "testuser", "password": "wrongpassword"}
        response = client.post(
            "/auth/login", data=json.dumps(login_data), content_type="application/json"
        )

        assert response.status_code == 401
        data = response.get_json()
        assert "error" in data

    def test_me_route_success(self, client, auth_headers):
        """Test /auth/me endpoint with valid token."""
        response = client.get("/auth/me", headers=auth_headers)

        assert response.status_code == 200
        data = response.get_json()
        assert data["message"] == "Retrieved current user successfully"
        assert data["data"]["username"] == "testuser"

    def test_me_route_no_token(self, client):
        """Test /auth/me endpoint without token."""
        response = client.get("/auth/me")

        assert response.status_code == 401
