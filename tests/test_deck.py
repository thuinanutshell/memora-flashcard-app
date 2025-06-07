import pytest
from backend.models import db, Folder, Deck


class TestDeckRoutes:
    """Test suite for deck-related endpoints"""

    @pytest.fixture(autouse=True)
    def setup(self, test_client):
        """Setup test data before each test"""
        self.client = test_client

        # Clear and recreate database
        with self.client.application.app_context():
            db.drop_all()
            db.create_all()

        # Register and login a test user
        self.client.post(
            "/auth/register",
            json={
                "full_name": "Test User",
                "username": "testuser",
                "email": "test@example.com",
                "password": "testpass",
            },
        )
        login_res = self.client.post(
            "/auth/login", json={"login": "testuser", "password": "testpass"}
        )
        self.access_token = login_res.get_json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.access_token}"}

        # Create a test folder
        folder_res = self.client.post(
            "/folder/",
            json={"name": "Test Folder", "description": "Initial description"},
            headers=self.headers,
        )
        assert folder_res.status_code == 201
        self.folder_id = folder_res.get_json().get("id")

        # Create a test deck
        deck_res = self.client.post(
            f"/deck/{self.folder_id}",
            json={"name": "Test Deck", "description": "Initial description"},
            headers=self.headers,
        )
        assert deck_res.status_code == 201
        self.deck_id = deck_res.get_json().get("deck_id")

    def test_add_deck_success(self):
        """Test creating a new deck"""
        response = self.client.post(
            f"/deck/{self.folder_id}",
            json={"name": "New Deck", "description": "Test description"},
            headers=self.headers,
        )
        assert response.status_code == 201
        data = response.get_json()
        assert data["message"] == "A new deck is added"
        assert isinstance(data["deck_id"], int)

    def test_add_deck_missing_name(self):
        """Test creating deck without name"""
        response = self.client.post(
            f"/deck/{self.folder_id}",
            json={"description": "No name provided"},
            headers=self.headers,
        )
        assert response.status_code == 400
        assert b"Deck name is required" in response.data

    def test_add_deck_duplicate_name(self):
        """Test creating deck with duplicate name"""
        response = self.client.post(
            f"/deck/{self.folder_id}",
            json={"name": "Test Deck", "description": "Duplicate test"},
            headers=self.headers,
        )
        assert response.status_code == 409
        assert b"Deck name already exists" in response.data

    def test_add_deck_nonexistent_folder(self):
        """Test creating deck in non-existent folder"""
        response = self.client.post(
            "/deck/9999",
            json={"name": "New Deck", "description": "Test description"},
            headers=self.headers,
        )
        assert response.status_code == 404
        assert b"Folder not found" in response.data

    def test_get_deck_success(self):
        """Test retrieving a specific deck"""
        response = self.client.get(f"/deck/{self.deck_id}", headers=self.headers)
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data["cards"], list)

    def test_get_nonexistent_deck(self):
        """Test retrieving non-existent deck"""
        response = self.client.get("/deck/9999", headers=self.headers)
        assert response.status_code == 404
        assert b"Deck not found" in response.data

    def test_update_deck_name(self):
        """Test updating a deck's name"""
        response = self.client.patch(
            f"/deck/{self.deck_id}",
            json={"name": "Updated Name"},
            headers=self.headers,
        )
        assert response.status_code == 200
        assert b"Updated deck" in response.data

    def test_update_deck_description(self):
        """Test updating a deck's description"""
        response = self.client.patch(
            f"/deck/{self.deck_id}",
            json={"description": "Updated description"},
            headers=self.headers,
        )
        assert response.status_code == 200
        assert b"Updated deck" in response.data

    def test_update_deck_duplicate_name(self):
        """Test updating to a duplicate deck name"""
        # Create second deck
        self.client.post(
            f"/deck/{self.folder_id}",
            json={"name": "Second Deck", "description": "Test"},
            headers=self.headers,
        )

        # Try to rename first deck to same name
        response = self.client.patch(
            f"/deck/{self.deck_id}",
            json={"name": "Second Deck"},
            headers=self.headers,
        )
        assert response.status_code == 409
        assert b"Deck name already exists" in response.data

    def test_delete_deck(self):
        """Test deleting a deck"""
        response = self.client.delete(f"/deck/{self.deck_id}", headers=self.headers)
        assert response.status_code == 200
        assert b"Deleted deck" in response.data

        # Verify deck is gone
        verify_res = self.client.get(f"/deck/{self.deck_id}", headers=self.headers)
        assert verify_res.status_code == 404

    def test_unauthorized_access(self):
        """Test endpoints without authentication"""
        endpoints = [
            (
                "POST",
                f"/deck/{self.folder_id}",
                {"name": "Test", "description": "Test"},
            ),
            ("GET", f"/deck/{self.deck_id}", None),
            ("PATCH", f"/deck/{self.deck_id}", {"name": "Test"}),
            ("DELETE", f"/deck/{self.deck_id}", None),
        ]

        for method, endpoint, data in endpoints:
            if method == "GET":
                response = self.client.get(endpoint)
            elif method == "POST":
                response = self.client.post(endpoint, json=data)
            elif method == "PATCH":
                response = self.client.patch(endpoint, json=data)
            elif method == "DELETE":
                response = self.client.delete(endpoint)
            assert response.status_code == 401
