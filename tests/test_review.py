import pytest
from backend.models import db, Folder, Deck, Card, Review
from datetime import datetime, timedelta
from unittest.mock import patch


class TestReviewRoutes:
    """Test suite for review-related endpoints"""

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

        # Create test cards
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

        # Create another card for testing
        card_res2 = self.client.post(
            f"/card/{self.deck_id}",
            json={
                "question": "What is Python?",
                "answer": "Python is a programming language",
                "difficulty_level": "medium",
            },
            headers=self.headers,
        )
        assert card_res2.status_code == 201
        self.card_id2 = card_res2.get_json()["card"]["card_id"]

    @patch("backend.blueprints.bp_review.semantic_similarity")
    def test_submit_review_success(self, mock_similarity):
        """Test submitting a review for a card"""
        mock_similarity.return_value = 85.0

        response = self.client.post(
            f"/review/{self.card_id}",
            json={"answer": "Flask is a web framework", "note": "Good attempt"},
            headers=self.headers,
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data["message"] == "Review recorded successfully"
        assert data["reviews_completed"] == 1
        assert data["reviews_remaining"] == 2
        assert data["is_fully_reviewed"] == False
        assert "next_review_date" in data

    @patch("backend.blueprints.bp_review.semantic_similarity")
    def test_submit_review_card_not_found(self, mock_similarity):
        """Test submitting a review for a non-existent card"""
        response = self.client.post(
            "/review/9999",
            json={"answer": "Some answer", "note": "Test note"},
            headers=self.headers,
        )

        assert response.status_code == 404
        assert b"Card not found" in response.data

    @patch("backend.blueprints.bp_review.semantic_similarity")
    def test_submit_review_missing_answer(self, mock_similarity):
        """Test submitting a review without an answer"""
        response = self.client.post(
            f"/review/{self.card_id}",
            json={"note": "Test note"},
            headers=self.headers,
        )

        # Should handle missing answer gracefully
        assert response.status_code in [400, 500]

    @patch("backend.blueprints.bp_review.semantic_similarity")
    def test_submit_multiple_reviews_until_fully_reviewed(self, mock_similarity):
        """Test submitting multiple reviews until card is fully reviewed"""
        mock_similarity.return_value = 90.0

        # Submit first review
        response1 = self.client.post(
            f"/review/{self.card_id}",
            json={"answer": "Flask is a framework", "note": "First review"},
            headers=self.headers,
        )
        assert response1.status_code == 201
        data1 = response1.get_json()
        assert data1["reviews_completed"] == 1
        assert data1["is_fully_reviewed"] == False

        # Submit second review
        response2 = self.client.post(
            f"/review/{self.card_id}",
            json={"answer": "Flask is a web framework", "note": "Second review"},
            headers=self.headers,
        )
        assert response2.status_code == 201
        data2 = response2.get_json()
        assert data2["reviews_completed"] == 2
        assert data2["is_fully_reviewed"] == False

        # Submit third review (should be fully reviewed)
        response3 = self.client.post(
            f"/review/{self.card_id}",
            json={"answer": "Flask is a lightweight framework", "note": "Third review"},
            headers=self.headers,
        )
        assert response3.status_code == 201
        data3 = response3.get_json()
        assert data3["reviews_completed"] == 3
        assert data3["is_fully_reviewed"] == True
        assert "next_review_date" not in data3

    def test_get_dashboard_stats_empty(self):
        """Test getting dashboard stats with no reviews"""
        response = self.client.get("/review/dashboard", headers=self.headers)

        assert response.status_code == 200
        data = response.get_json()
        assert "cards_due_today" in data
        assert "cards_due_this_week" in data
        assert "cards_due_this_month" in data
        assert isinstance(data["cards_due_today"], int)

    @patch("backend.blueprints.bp_review.semantic_similarity")
    def test_get_dashboard_stats_with_reviews(self, mock_similarity):
        """Test getting dashboard stats after submitting reviews"""
        mock_similarity.return_value = 80.0

        # Submit a review first
        self.client.post(
            f"/review/{self.card_id}",
            json={"answer": "Flask framework", "note": "Test"},
            headers=self.headers,
        )

        response = self.client.get("/review/dashboard", headers=self.headers)

        assert response.status_code == 200
        data = response.get_json()
        assert all(
            key in data
            for key in [
                "cards_due_today",
                "cards_due_this_week",
                "cards_due_this_month",
            ]
        )

    def test_get_general_stats_no_reviews(self):
        """Test getting general stats with no reviews"""
        response = self.client.get("/review/stats/general", headers=self.headers)

        assert response.status_code == 200
        data = response.get_json()
        assert data["average_score"] == 0
        assert data["fully_reviewed_cards"] == 0
        assert data["study_streak"] == 0
        assert isinstance(data["accuracy_graph"], dict)

    @patch("backend.blueprints.bp_review.semantic_similarity")
    def test_get_general_stats_with_reviews(self, mock_similarity):
        """Test getting general stats after submitting reviews"""
        mock_similarity.return_value = 85.0

        # Submit reviews for multiple cards
        self.client.post(
            f"/review/{self.card_id}",
            json={"answer": "Flask framework", "note": "Test 1"},
            headers=self.headers,
        )
        self.client.post(
            f"/review/{self.card_id2}",
            json={"answer": "Python language", "note": "Test 2"},
            headers=self.headers,
        )

        response = self.client.get("/review/stats/general", headers=self.headers)

        assert response.status_code == 200
        data = response.get_json()
        assert data["average_score"] > 0
        assert data["study_streak"] >= 0
        assert "Test Folder" in data["accuracy_graph"]

    def test_get_folder_stats_not_found(self):
        """Test getting stats for a non-existent folder"""
        response = self.client.get("/review/stats/folder/9999", headers=self.headers)

        assert response.status_code == 404
        assert b"Folder not found" in response.data

    def test_get_folder_stats_success(self):
        """Test getting folder stats successfully"""
        response = self.client.get(
            f"/review/stats/folder/{self.folder_id}", headers=self.headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data["folder_name"] == "Test Folder"
        assert "average_score" in data
        assert "fully_reviewed_cards" in data
        assert "study_streak" in data
        assert "accuracy_graph" in data

    @patch("backend.blueprints.bp_review.semantic_similarity")
    def test_get_folder_stats_with_reviews(self, mock_similarity):
        """Test getting folder stats after submitting reviews"""
        mock_similarity.return_value = 75.0

        # Submit a review
        self.client.post(
            f"/review/{self.card_id}",
            json={"answer": "Flask framework", "note": "Test"},
            headers=self.headers,
        )

        response = self.client.get(
            f"/review/stats/folder/{self.folder_id}", headers=self.headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data["average_score"] > 0
        assert "Test Deck" in data["accuracy_graph"]

    def test_get_deck_stats_not_found(self):
        """Test getting stats for a non-existent deck"""
        response = self.client.get("/review/stats/deck/9999", headers=self.headers)

        assert response.status_code == 404
        assert b"Deck not found" in response.data

    def test_get_deck_stats_success(self):
        """Test getting deck stats successfully"""
        response = self.client.get(
            f"/review/stats/deck/{self.deck_id}", headers=self.headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data["deck_name"] == "Test Deck"
        assert "average_score" in data
        assert "fully_reviewed_cards" in data
        assert "study_streak" in data
        assert "accuracy_graph" in data

    @patch("backend.blueprints.bp_review.semantic_similarity")
    def test_get_deck_stats_with_reviews(self, mock_similarity):
        """Test getting deck stats after submitting reviews"""
        mock_similarity.return_value = 88.0

        # Submit multiple reviews
        self.client.post(
            f"/review/{self.card_id}",
            json={"answer": "Flask framework", "note": "Test 1"},
            headers=self.headers,
        )
        self.client.post(
            f"/review/{self.card_id2}",
            json={"answer": "Python language", "note": "Test 2"},
            headers=self.headers,
        )

        response = self.client.get(
            f"/review/stats/deck/{self.deck_id}", headers=self.headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data["average_score"] > 0
        assert len(data["accuracy_graph"]) == 2

    def test_submit_review_invalid_json(self):
        """Test submitting review with invalid JSON"""
        response = self.client.post(
            f"/review/{self.card_id}",
            data="Not a JSON",
            headers={"Content-Type": "text/plain", **self.headers},
        )
        assert response.status_code in {400, 415}

    def test_unauthorized_access(self):
        """Test all review routes without authentication"""
        endpoints = [
            (
                "POST",
                f"/review/{self.card_id}",
                {"answer": "Test answer", "note": "Test"},
            ),
            ("GET", "/review/dashboard", None),
            ("GET", "/review/stats/general", None),
            ("GET", f"/review/stats/folder/{self.folder_id}", None),
            ("GET", f"/review/stats/deck/{self.deck_id}", None),
        ]

        for method, endpoint, data in endpoints:
            if method == "GET":
                response = self.client.get(endpoint)
            elif method == "POST":
                response = self.client.post(endpoint, json=data)
            assert response.status_code == 401

    @patch("backend.blueprints.bp_review.semantic_similarity")
    def test_semantic_similarity_integration(self, mock_similarity):
        """Test that semantic similarity function is called correctly"""
        mock_similarity.return_value = 92.5

        response = self.client.post(
            f"/review/{self.card_id}",
            json={
                "answer": "Flask is a web framework for Python",
                "note": "Detailed answer",
            },
            headers=self.headers,
        )

        assert response.status_code == 201
        # Verify the mock was called with correct arguments
        mock_similarity.assert_called_once()
        args = mock_similarity.call_args[0]
        assert args[0] == "Flask is a web framework for Python"
        assert args[1] == "Flask is a lightweight framework for backend"

    @patch("backend.blueprints.bp_review.semantic_similarity")
    def test_review_with_empty_note(self, mock_similarity):
        """Test submitting review with empty note"""
        mock_similarity.return_value = 70.0

        response = self.client.post(
            f"/review/{self.card_id}",
            json={"answer": "Flask framework", "note": ""},
            headers=self.headers,
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data["message"] == "Review recorded successfully"

    @patch("backend.blueprints.bp_review.semantic_similarity")
    def test_review_without_note(self, mock_similarity):
        """Test submitting review without note field"""
        mock_similarity.return_value = 65.0

        response = self.client.post(
            f"/review/{self.card_id}",
            json={"answer": "Flask framework"},
            headers=self.headers,
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data["message"] == "Review recorded successfully"
