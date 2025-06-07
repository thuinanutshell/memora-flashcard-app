import json


def test_register(test_client):
    """Test user registration"""
    # Test successful registration
    response = test_client.post(
        "/auth/register",
        json={
            "full_name": "John Doe",
            "username": "johndoe",
            "email": "john@example.com",
            "password": "secure123",
        },
    )
    assert response.status_code == 201
    assert b"New user created" in response.data

    # Test duplicate registration
    dup_response = test_client.post(
        "/auth/register",
        json={
            "full_name": "John Doe",
            "username": "johndoe",  # Duplicate username
            "email": "john2@example.com",
            "password": "secure123",
        },
    )
    assert dup_response.status_code == 409


def test_login(test_client):
    """Test login functionality"""
    # First register a test user
    test_client.post(
        "/auth/register",
        json={
            "full_name": "Login Test",
            "username": "logintest",
            "email": "login@example.com",
            "password": "loginpass",
        },
    )

    # Test successful login with username
    response = test_client.post(
        "/auth/login", json={"login": "logintest", "password": "loginpass"}
    )

    # Check status code
    assert response.status_code == 200

    # Parse JSON response
    response_data = response.get_json()

    # Check the response structure
    assert "access_token" in response_data
    assert isinstance(response_data["access_token"], str)
    assert len(response_data["access_token"]) > 0  # Verify token is not empty
    assert "message" in response_data
    assert "user_id" in response_data


def test_protected_route(test_client, auth_tokens):
    """Test JWT-protected route"""
    # Access protected route with valid token
    response = test_client.get("/auth/protected", headers=auth_tokens["auth_header"])
    assert response.status_code == 200
    assert b"username" in response.data

    # Access without token
    no_token_response = test_client.get("/auth/protected")
    assert no_token_response.status_code == 401


def test_logout(test_client, auth_tokens):
    """Test token revocation"""
    # First access protected route (should work)
    protected_res = test_client.get(
        "/auth/protected", headers=auth_tokens["auth_header"]
    )
    assert protected_res.status_code == 200

    # Now logout
    logout_res = test_client.post("/auth/logout", headers=auth_tokens["auth_header"])
    assert logout_res.status_code == 200

    # Try accessing protected route again (should fail)
    protected_after_logout = test_client.get(
        "/auth/protected", headers=auth_tokens["auth_header"]
    )
    assert protected_after_logout.status_code == 401
