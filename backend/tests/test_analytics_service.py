import pytest
from datetime import datetime, timedelta
from models import User, Folder, Deck, Card, Review, db
from services.analytics_service import AnalyticsService


class TestAnalyticsService:

    @pytest.fixture(autouse=True)
    def setup_test_data(self, app):
        """Setup comprehensive test data for analytics tests."""
        with app.app_context():
            # Create test user
            self.user = User(
                full_name="Analytics User",
                username="analyticsuser",
                email="analytics@example.com",
                password_hash="hashed_password",
            )
            db.session.add(self.user)
            db.session.flush()

            # Create test folders
            self.folder1 = Folder(
                name="Mathematics",
                description="Math study materials",
                user_id=self.user.id,
            )
            self.folder2 = Folder(
                name="Science",
                description="Science study materials",
                user_id=self.user.id,
            )
            db.session.add_all([self.folder1, self.folder2])
            db.session.flush()

            # Create test decks
            self.deck1 = Deck(
                name="Algebra",
                description="Algebra basics",
                folder_id=self.folder1.id,
            )
            self.deck2 = Deck(
                name="Geometry",
                description="Geometry fundamentals",
                folder_id=self.folder1.id,
            )
            self.deck3 = Deck(
                name="Physics",
                description="Physics concepts",
                folder_id=self.folder2.id,
            )
            db.session.add_all([self.deck1, self.deck2, self.deck3])
            db.session.flush()

            # Create test cards
            self.card1 = Card(
                question="What is 2+2?",
                answer="4",
                difficulty_level="easy",
                deck_id=self.deck1.id,
                review_count=3,
                is_fully_reviewed=True,
            )
            self.card2 = Card(
                question="What is the area of a circle?",
                answer="π × r²",
                difficulty_level="medium",
                deck_id=self.deck2.id,
                review_count=1,
                is_fully_reviewed=False,
            )
            self.card3 = Card(
                question="What is Newton's first law?",
                answer="An object at rest stays at rest",
                difficulty_level="hard",
                deck_id=self.deck3.id,
                review_count=0,
                is_fully_reviewed=False,
            )
            db.session.add_all([self.card1, self.card2, self.card3])
            db.session.flush()

            # Create test reviews with different dates for streak testing
            today = datetime.utcnow()
            yesterday = today - timedelta(days=1)
            two_days_ago = today - timedelta(days=2)

            self.review1 = Review(
                card_id=self.card1.id,
                user_id=self.user.id,
                user_answer="4",
                score=95.0,
                reviewed_at=today,
            )
            self.review2 = Review(
                card_id=self.card1.id,
                user_id=self.user.id,
                user_answer="four",
                score=85.0,
                reviewed_at=yesterday,
            )
            self.review3 = Review(
                card_id=self.card2.id,
                user_id=self.user.id,
                user_answer="pi times r squared",
                score=90.0,
                reviewed_at=two_days_ago,
            )
            db.session.add_all([self.review1, self.review2, self.review3])
            db.session.commit()

            # Store IDs for test access
            self.user_id = self.user.id
            self.folder1_id = self.folder1.id
            self.folder2_id = self.folder2.id
            self.deck1_id = self.deck1.id
            self.deck2_id = self.deck2.id
            self.deck3_id = self.deck3.id

    def test_get_general_stats_success(self, app):
        """Test getting general user statistics."""
        with app.app_context():
            result = AnalyticsService.get_general_stats(self.user_id)

            # Check result structure
            assert "data" in result
            data = result["data"]

            # Check required fields
            assert "id" in data
            assert "total_folders" in data
            assert "total_decks" in data
            assert "total_reviews" in data
            assert "streak" in data

            # Check values match test data
            assert data["id"] == self.user_id
            assert data["total_folders"] == 2  # Math and Science folders
            assert data["total_decks"] == 3  # Algebra, Geometry, Physics decks
            assert data["total_reviews"] == 3  # 3 reviews created
            assert data["streak"] >= 2  # Should have at least 2-day streak

    def test_get_general_stats_study_streak_calculation(self, app):
        """Test study streak calculation with different review patterns."""
        with app.app_context():
            # Test current setup (reviews on consecutive days)
            result = AnalyticsService.get_general_stats(self.user_id)
            assert result["data"]["streak"] >= 2

            # Create new user with no reviews
            new_user = User(
                full_name="No Reviews User",
                username="noreviews",
                email="noreviews@example.com",
                password_hash="hash",
            )
            db.session.add(new_user)
            db.session.commit()

            # User with no reviews should have 0 streak
            result = AnalyticsService.get_general_stats(new_user.id)
            assert result["data"]["streak"] == 0

    def test_get_general_stats_nonexistent_user(self, app):
        """Test getting stats for non-existent user."""
        with app.app_context():
            with pytest.raises(ValueError, match="User not found"):
                AnalyticsService.get_general_stats("nonexistent-user-id")

    def test_get_stats_one_folder_success(self, app):
        """Test getting statistics for a specific folder."""
        with app.app_context():
            result = AnalyticsService.get_stats_one_folder(
                self.user_id, self.folder1_id
            )

            # Check result structure
            assert "data" in result
            data = result["data"]

            assert "folder_name" in data
            assert "accuracy_graph" in data
            assert "full_reviewed_cards" in data
            assert "remaining_cards" in data

            # Check values
            assert data["folder_name"] == "Mathematics"
            assert data["full_reviewed_cards"] == 1  # Only card1 is fully reviewed
            assert data["remaining_cards"] == 1  # card2 is not fully reviewed

            # Check accuracy graph has data for decks in this folder
            assert "Algebra" in data["accuracy_graph"]
            assert "Geometry" in data["accuracy_graph"]
            assert "Physics" not in data["accuracy_graph"]  # Physics is in folder2

    def test_get_stats_one_folder_nonexistent(self, app):
        """Test getting stats for non-existent folder."""
        with app.app_context():
            with pytest.raises(ValueError, match="Folder not found"):
                AnalyticsService.get_stats_one_folder(self.user_id, 99999)

    def test_get_stats_one_folder_wrong_user(self, app):
        """Test getting folder stats for wrong user."""
        with app.app_context():
            # Create another user
            other_user = User(
                full_name="Other User",
                username="otheruser",
                email="other@example.com",
                password_hash="hash",
            )
            db.session.add(other_user)
            db.session.commit()

            # Try to access folder1 with other user's ID
            with pytest.raises(ValueError, match="Folder not found"):
                AnalyticsService.get_stats_one_folder(other_user.id, self.folder1_id)

    def test_get_stats_one_deck_success(self, app):
        """Test getting statistics for a specific deck."""
        with app.app_context():
            result = AnalyticsService.get_stats_one_deck(self.user_id, self.deck1_id)

            # Check result structure
            assert "data" in result
            data = result["data"]

            assert "deck_name" in data
            assert "accuracy_graph" in data
            assert "average_score" in data
            assert "full_reviewed_cards" in data
            assert "remaining_cards" in data

            # Check values for Algebra deck
            assert data["deck_name"] == "Algebra"
            assert data["full_reviewed_cards"] == 1  # card1 is fully reviewed
            assert data["remaining_cards"] == 0  # no other cards in this deck
            assert data["average_score"] > 0  # Should have average from reviews

            # Check accuracy graph has review data
            assert isinstance(data["accuracy_graph"], list)
            assert len(data["accuracy_graph"]) >= 2  # Should have 2 reviews for card1

    def test_get_stats_one_deck_nonexistent(self, app):
        """Test getting stats for non-existent deck."""
        with app.app_context():
            with pytest.raises(ValueError, match="Deck not found"):
                AnalyticsService.get_stats_one_deck(self.user_id, 99999)

    def test_get_stats_one_deck_wrong_user(self, app):
        """Test getting deck stats for wrong user."""
        with app.app_context():
            # Create another user
            other_user = User(
                full_name="Other User",
                username="otheruser2",
                email="other2@example.com",
                password_hash="hash",
            )
            db.session.add(other_user)
            db.session.commit()

            # Try to access deck1 with other user's ID
            with pytest.raises(ValueError, match="Deck not found"):
                AnalyticsService.get_stats_one_deck(other_user.id, self.deck1_id)

    def test_accuracy_graph_data_format(self, app):
        """Test that accuracy graph data has correct format."""
        with app.app_context():
            result = AnalyticsService.get_stats_one_deck(self.user_id, self.deck1_id)
            accuracy_graph = result["data"]["accuracy_graph"]

            # Each entry should have timestamp and score
            for entry in accuracy_graph:
                assert "timestamp" in entry
                assert "score" in entry
                assert isinstance(entry["score"], (int, float))
                # Timestamp should be valid ISO format
                datetime.fromisoformat(entry["timestamp"].replace("Z", "+00:00"))

    def test_folder_accuracy_graph_multiple_decks(self, app):
        """Test folder accuracy graph includes multiple decks."""
        with app.app_context():
            result = AnalyticsService.get_stats_one_folder(
                self.user_id, self.folder1_id
            )
            accuracy_graph = result["data"]["accuracy_graph"]

            # Should have entries for both Algebra and Geometry decks
            assert "Algebra" in accuracy_graph
            assert "Geometry" in accuracy_graph

            # Algebra should have reviews, Geometry might be empty
            assert isinstance(accuracy_graph["Algebra"], list)
            assert isinstance(accuracy_graph["Geometry"], list)

    def test_empty_deck_statistics(self, app):
        """Test statistics for deck with no reviews."""
        with app.app_context():
            # deck3 (Physics) has a card but no reviews
            result = AnalyticsService.get_stats_one_deck(self.user_id, self.deck3_id)
            data = result["data"]

            assert data["deck_name"] == "Physics"
            assert data["average_score"] == 0  # No reviews = 0 average
            assert data["full_reviewed_cards"] == 0
            assert data["remaining_cards"] == 1  # card3 is not reviewed
            assert data["accuracy_graph"] == []  # No reviews = empty graph
