import pytest
import json
from models import User, Folder, Deck, Card, Review, db
from datetime import datetime, timedelta


class TestReviewRoutes:

    @pytest.fixture(autouse=True)
    def setup_test_data(self, app, auth_headers):
        """Setup test data for review route tests."""
        with app.app_context():
            # Get user from auth headers (created in conftest)
            user = User.query.filter_by(username="testuser").first()
            self.user_id = user.id

            # Create test folder
            folder = Folder(
                name="Test Subject",
                description="Test folder for reviews",
                user_id=self.user_id,
            )
            db.session.add(folder)
            db.session.flush()

            # Create test deck
            deck = Deck(
                name="Test Deck",
                description="Test deck for reviews",
                folder_id=folder.id,
            )
            db.session.add(deck)
            db.session.flush()

            # Create test cards
            self.card1 = Card(
                question="What is the capital of France?",
                answer="Paris is the capital of France",
                difficulty_level="easy",
                deck_id=deck.id,
                next_review_at=datetime.utcnow() + timedelta(days=1),
                review_count=0,
                is_fully_reviewed=False,
            )

            self.card2 = Card(
                question="What is 2+2?",
                answer="4",
                difficulty_level="easy",
                deck_id=deck.id,
                next_review_at=datetime.utcnow() + timedelta(days=1),
                review_count=2,
                is_fully_reviewed=False,
            )

            db.session.add_all([self.card1, self.card2])
            db.session.flush()

            # Create some existing reviews for card2
            review1 = Review(
                card_id=self.card2.id,
                user_id=self.user_id,
                user_answer="four",
                score=85.0,
                reviewed_at=datetime.utcnow() - timedelta(days=2),
            )

            review2 = Review(
                card_id=self.card2.id,
                user_id=self.user_id,
                user_answer="4",
                score=95.0,
                reviewed_at=datetime.utcnow() - timedelta(days=1),
            )

            db.session.add_all([review1, review2])
            db.session.commit()

            # Store IDs for tests
            self.card1_id = self.card1.id
            self.card2_id = self.card2.id

    def test_submit_review_success(self, client, auth_headers):
        """Test successful review submission."""
        review_data = {"answer": "Paris"}

        response = client.post(
            f"/review/card/{self.card1_id}",
            data=json.dumps(review_data),
            content_type="application/json",
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data["message"] == "Review submitted successfully"
        assert "data" in data
        assert "review_id" in data["data"]
        assert "score" in data["data"]
        assert "next_review_at" in data["data"]

        # Verify score is reasonable for partial match
        assert 0 <= data["data"]["score"] <= 100

    def test_submit_review_exact_answer(self, client, auth_headers):
        """Test review submission with exact answer."""
        review_data = {"answer": "Paris is the capital of France"}

        response = client.post(
            f"/review/card/{self.card1_id}",
            data=json.dumps(review_data),
            content_type="application/json",
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.get_json()

        # Exact answer should get high score
        assert data["data"]["score"] > 90

    def test_submit_review_missing_answer(self, client, auth_headers):
        """Test review submission without answer."""
        review_data = {}

        response = client.post(
            f"/review/card/{self.card1_id}",
            data=json.dumps(review_data),
            content_type="application/json",
            headers=auth_headers,
        )

        assert response.status_code == 400
        data = response.get_json()
        assert "Answer is required" in data["error"]

    def test_submit_review_empty_answer(self, client, auth_headers):
        """Test review submission with empty answer."""
        review_data = {"answer": ""}

        response = client.post(
            f"/review/card/{self.card1_id}",
            data=json.dumps(review_data),
            content_type="application/json",
            headers=auth_headers,
        )

        assert response.status_code == 400
        data = response.get_json()
        assert "Answer cannot be empty" in data["error"]

    def test_submit_review_nonexistent_card(self, client, auth_headers):
        """Test review submission for non-existent card."""
        review_data = {"answer": "Some answer"}

        response = client.post(
            "/review/card/99999",
            data=json.dumps(review_data),
            content_type="application/json",
            headers=auth_headers,
        )

        assert response.status_code == 404
        data = response.get_json()
        assert "Card not found or access denied" in data["error"]

    def test_submit_review_unauthorized(self, client):
        """Test review submission without authentication."""
        review_data = {"answer": "Paris"}

        response = client.post(
            f"/review/card/{self.card1_id}",
            data=json.dumps(review_data),
            content_type="application/json",
        )

        assert response.status_code == 401

    def test_get_card_review_history_success(self, client, auth_headers):
        """Test getting review history for a card."""
        response = client.get(
            f"/review/card/{self.card2_id}/history",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data["message"] == "Review history retrieved successfully"
        assert "data" in data
        assert "card_info" in data["data"]
        assert "reviews" in data["data"]

        # Check card info
        card_info = data["data"]["card_info"]
        assert card_info["id"] == self.card2_id
        assert card_info["question"] == "What is 2+2?"
        assert card_info["answer"] == "4"
        assert card_info["review_count"] >= 2  # Has existing reviews

        # Check reviews list
        reviews = data["data"]["reviews"]
        assert len(reviews) >= 2  # Should have at least 2 existing reviews

        # Verify review structure
        for review in reviews:
            assert "id" in review
            assert "user_answer" in review
            assert "score" in review
            assert "reviewed_at" in review

    def test_get_card_review_history_with_limit(self, client, auth_headers):
        """Test getting review history with limit parameter."""
        response = client.get(
            f"/review/card/{self.card2_id}/history?limit=1",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.get_json()
        reviews = data["data"]["reviews"]
        assert len(reviews) <= 1

    def test_get_card_review_history_nonexistent_card(self, client, auth_headers):
        """Test getting review history for non-existent card."""
        response = client.get(
            "/review/card/99999/history",
            headers=auth_headers,
        )

        assert response.status_code == 404
        data = response.get_json()
        assert "Card not found or access denied" in data["error"]

    def test_get_card_review_history_unauthorized(self, client):
        """Test getting review history without authentication."""
        response = client.get(f"/review/card/{self.card2_id}/history")

        assert response.status_code == 401

    def test_get_card_review_history_empty(self, client, auth_headers):
        """Test getting review history for card with no reviews."""
        response = client.get(
            f"/review/card/{self.card1_id}/history",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.get_json()

        # Should return empty reviews list
        reviews = data["data"]["reviews"]
        assert len(reviews) == 0

        # But card info should still be present
        card_info = data["data"]["card_info"]
        assert card_info["id"] == self.card1_id
        assert card_info["review_count"] == 0

    def test_review_workflow_progression(self, client, auth_headers):
        """Test complete review workflow with multiple submissions."""
        # Submit first review
        review1_data = {"answer": "Paris"}
        response1 = client.post(
            f"/review/card/{self.card1_id}",
            data=json.dumps(review1_data),
            content_type="application/json",
            headers=auth_headers,
        )

        assert response1.status_code == 201

        # Submit second review
        review2_data = {"answer": "Paris is the capital"}
        response2 = client.post(
            f"/review/card/{self.card1_id}",
            data=json.dumps(review2_data),
            content_type="application/json",
            headers=auth_headers,
        )

        assert response2.status_code == 201

        # Submit third review (should mark as fully reviewed)
        review3_data = {"answer": "Paris is the capital of France"}
        response3 = client.post(
            f"/review/card/{self.card1_id}",
            data=json.dumps(review3_data),
            content_type="application/json",
            headers=auth_headers,
        )

        assert response3.status_code == 201

        # Check that we now have 3 reviews in history
        history_response = client.get(
            f"/review/card/{self.card1_id}/history",
            headers=auth_headers,
        )

        assert history_response.status_code == 200
        history_data = history_response.get_json()
        reviews = history_data["data"]["reviews"]
        assert len(reviews) == 3

        # Verify card is now fully reviewed
        card_info = history_data["data"]["card_info"]
        assert card_info["review_count"] == 3
        # Note: is_fully_reviewed status depends on service logic

    def test_review_scores_different_answers(self, client, auth_headers):
        """Test that different quality answers get different scores."""
        # Submit excellent answer
        excellent_answer = {"answer": "Paris is the capital of France"}
        response1 = client.post(
            f"/review/card/{self.card1_id}",
            data=json.dumps(excellent_answer),
            content_type="application/json",
            headers=auth_headers,
        )

        score1 = response1.get_json()["data"]["score"]

        # Submit poor answer
        poor_answer = {"answer": "London"}
        response2 = client.post(
            f"/review/card/{self.card1_id}",
            data=json.dumps(poor_answer),
            content_type="application/json",
            headers=auth_headers,
        )

        score2 = response2.get_json()["data"]["score"]

        # Excellent answer should score higher than poor answer
        assert score1 > score2
        assert score1 > 80  # Should be high score
        assert score2 < 60  # Should be low score
