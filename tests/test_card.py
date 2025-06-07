import pytest
from backend.models import db, Folder, Deck, Card


class TestCardRoutes:
    """Test suite for card-related endpoints"""

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

        # Create a card
        card_res = self.client.post(
            f"/card/{self.deck_id}",
            json={
                "question": "What is Flask?",
                "answer": "Flask is a lightweight framework for backend",
                "difficulty_level": "easy",
            },
            headers=self.headers,
        )
        assert card_res.status_code == 201
        self.card_id = card_res.get_json()["card"]["card_id"]

    def test_add_card_success(self):
        """Test creating a new card"""
        response = self.client.post(
            f"/card/{self.deck_id}",
            json={
                "question": "New Card",
                "answer": "New answer",
                "difficulty_level": "medium",
            },
            headers=self.headers,
        )
        assert response.status_code == 201
        data = response.get_json()
        assert data["message"] == "Added a new card"
        assert isinstance(data["card"]["card_id"], int)

    @pytest.mark.parametrize(
        "missing_field", ["question", "answer", "difficulty_level"]
    )
    def test_add_card_missing_required_fields(self, missing_field):
        """Test creating a card with each required field missing"""
        payload = {
            "question": "Sample Q",
            "answer": "Sample A",
            "difficulty_level": "easy",
        }
        del payload[missing_field]

        response = self.client.post(
            f"/card/{self.deck_id}", json=payload, headers=self.headers
        )
        assert response.status_code == 400
        assert b"Missing required fields" in response.data

    def test_add_card_duplicate_question(self):
        """Test adding a card with a duplicate question in the same deck"""
        response = self.client.post(
            f"/card/{self.deck_id}",
            json={
                "question": "What is Flask?",
                "answer": "Another answer",
                "difficulty_level": "easy",
            },
            headers=self.headers,
        )
        assert response.status_code == 409
        assert b"Question already exists" in response.data

    def test_get_card_success(self):
        """Test retrieving a specific card"""
        response = self.client.get(f"/card/{self.card_id}", headers=self.headers)
        assert response.status_code == 200
        data = response.get_json()["card"]
        assert data["question"] == "What is Flask?"
        assert data["difficulty_level"] == "easy"
        assert data["review_count"] == 0

    def test_get_card_not_found(self):
        """Test retrieving a non-existent card"""
        response = self.client.get("/card/9999", headers=self.headers)
        assert response.status_code == 404
        assert b"Card not found" in response.data

    def test_update_card_question(self):
        """Test updating a card's question"""
        response = self.client.patch(
            f"/card/{self.card_id}",
            json={"question": "Updated Question"},
            headers=self.headers,
        )
        assert response.status_code == 200
        assert b"Updated card" in response.data

        # Verify update
        verify = self.client.get(f"/card/{self.card_id}", headers=self.headers)
        assert verify.get_json()["card"]["question"] == "Updated Question"

    def test_update_card_to_duplicate_question(self):
        """Test updating a card's question to one that already exists"""
        # Create another card
        response = self.client.post(
            f"/card/{self.deck_id}",
            json={
                "question": "Unique question",
                "answer": "Answer",
                "difficulty_level": "easy",
            },
            headers=self.headers,
        )
        assert response.status_code == 201
        other_card_id = response.get_json()["card"]["card_id"]

        # Attempt to update it with a duplicate question
        update_res = self.client.patch(
            f"/card/{other_card_id}",
            json={"question": "What is Flask?"},  # Already exists
            headers=self.headers,
        )
        assert update_res.status_code == 409
        assert b"Question already exists" in update_res.data

    def test_patch_card_empty_payload(self):
        """Test PATCH with no update fields"""
        response = self.client.patch(
            f"/card/{self.card_id}", json={}, headers=self.headers
        )
        assert response.status_code == 200  # No change, still accepted

    def test_delete_card(self):
        """Test deleting a card"""
        response = self.client.delete(f"/card/{self.card_id}", headers=self.headers)
        assert response.status_code == 200
        assert b"Deleted card" in response.data

        # Verify card is gone
        verify_res = self.client.get(f"/card/{self.card_id}", headers=self.headers)
        assert verify_res.status_code == 404

    def test_add_card_invalid_json(self):
        """Test sending invalid JSON"""
        response = self.client.post(
            f"/card/{self.deck_id}",
            data="Not a JSON",
            headers={"Content-Type": "text/plain", **self.headers},
        )
        assert response.status_code in {400, 415}  # Depends on Flask error handling

    def test_unauthorized_access(self):
        """Test all card routes without authentication"""
        endpoints = [
            (
                "POST",
                f"/card/{self.deck_id}",
                {"question": "Test", "answer": "Test", "difficulty_level": "easy"},
            ),
            ("GET", f"/card/{self.card_id}", None),
            ("PATCH", f"/card/{self.card_id}", {"question": "Test"}),
            ("DELETE", f"/card/{self.card_id}", None),
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
