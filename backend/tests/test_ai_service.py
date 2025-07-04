import pytest
import tempfile
import os
from pathlib import Path
from services.ai_service import AIService
from models import User, Folder, Deck, Card, Review
from models.base import db


class TestAIService:

    @pytest.fixture(autouse=True)
    def setup_test_data(self, app):
        """Setup test data for AI service tests"""
        with app.app_context():
            # Create test user
            self.user = User(
                full_name="Test User",
                username="testuser",
                email="test@example.com",
                password_hash="dummy_hash",
            )
            db.session.add(self.user)
            db.session.flush()

            # Create test folder and deck
            self.folder = Folder(
                name="AI Test Subject",
                description="Test folder for AI",
                user_id=self.user.id,
            )
            db.session.add(self.folder)
            db.session.flush()

            self.deck = Deck(
                name="AI Test Deck",
                description="Test deck for AI generation",
                folder_id=self.folder.id,
            )
            db.session.add(self.deck)

            # Add some sample cards and reviews for insights testing
            self.card1 = Card(
                question="What is Python?",
                answer="A programming language",
                difficulty_level="easy",
                deck_id=self.deck.id,
                review_count=2,
                is_fully_reviewed=False,
            )
            db.session.add(self.card1)
            db.session.flush()

            # Add some sample reviews
            review1 = Review(
                user_answer="A programming language",
                score=95.0,
                card_id=self.card1.id,
                user_id=self.user.id,
            )
            review2 = Review(
                user_answer="Programming language for coding",
                score=85.0,
                card_id=self.card1.id,
                user_id=self.user.id,
            )
            db.session.add_all([review1, review2])
            db.session.commit()

    @pytest.mark.skipif(
        not os.getenv("GEMINI_API_KEY")
        or os.getenv("GEMINI_API_KEY") == "your_gemini_api_key_here",
        reason="GEMINI_API_KEY not set or is placeholder",
    )
    def test_generate_flashcards_from_text(self, app):
        """Test 1: Generate flashcards from text content"""
        with app.app_context():
            ai_service = AIService()

            test_content = """
            Machine Learning is a subset of artificial intelligence (AI) that provides 
            systems the ability to automatically learn and improve from experience without 
            being explicitly programmed. Machine learning focuses on the development of 
            computer programs that can access data and use it to learn for themselves.
            
            The process of learning begins with observations or data, such as examples, 
            direct experience, or instruction, in order to look for patterns in data and 
            make better decisions in the future based on the examples that we provide.
            """

            result = ai_service.generate_cards_from_text(
                content=test_content,
                num_cards=3,
                deck_id=self.deck.id,
                difficulty="medium",
            )

            # Verify response structure
            assert "data" in result
            assert "cards" in result["data"]
            assert "preview" in result["data"]
            assert result["data"]["preview"] is True
            assert result["data"]["deck_id"] == self.deck.id

            # Verify cards
            cards = result["data"]["cards"]
            assert len(cards) == 3

            for card in cards:
                assert "question" in card
                assert "answer" in card
                assert "difficulty_level" in card
                assert card["difficulty_level"] == "medium"
                assert len(card["question"]) > 0
                assert len(card["answer"]) > 0

            # Verify metadata
            metadata = result["data"]["metadata"]
            assert metadata["num_cards_generated"] == 3
            assert metadata["num_cards_requested"] == 3
            assert metadata["difficulty"] == "medium"
            assert metadata["content_length"] > 0

            print(f"✅ Generated {len(cards)} cards from text")
            for i, card in enumerate(cards, 1):
                print(f"Card {i}: {card['question']}")

    @pytest.mark.skipif(
        not os.getenv("GEMINI_API_KEY")
        or os.getenv("GEMINI_API_KEY") == "your_gemini_api_key_here",
        reason="GEMINI_API_KEY not set or is placeholder",
    )
    def test_generate_flashcards_from_pdf(self, app):
        """Test 2: Generate flashcards from PDF file"""
        reportlab = pytest.importorskip("reportlab", reason="reportlab not installed")

        with app.app_context():
            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import letter

            # Create a test PDF with some content
            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp_file:
                pdf_path = tmp_file.name

            try:
                # Create PDF content
                c = canvas.Canvas(pdf_path, pagesize=letter)
                c.drawString(100, 750, "Introduction to Data Science")
                c.drawString(100, 720, "")
                c.drawString(
                    100,
                    690,
                    "Data Science is an interdisciplinary field that uses scientific",
                )
                c.drawString(
                    100,
                    670,
                    "methods, processes, algorithms and systems to extract knowledge",
                )
                c.drawString(
                    100, 650, "and insights from structured and unstructured data."
                )
                c.drawString(100, 620, "")
                c.drawString(100, 590, "Key components of Data Science include:")
                c.drawString(100, 570, "- Statistics and Mathematics")
                c.drawString(100, 550, "- Programming (Python, R)")
                c.drawString(100, 530, "- Machine Learning")
                c.drawString(100, 510, "- Data Visualization")
                c.save()

                # Create mock file object that mimics uploaded file
                class MockPDFFile:
                    def __init__(self, file_path, filename):
                        self.file_path = file_path
                        self.filename = filename

                    def read(self):
                        with open(self.file_path, "rb") as f:
                            return f.read()

                mock_pdf = MockPDFFile(pdf_path, "data_science_intro.pdf")

                ai_service = AIService()

                result = ai_service.generate_cards_from_pdf(
                    pdf_file=mock_pdf,
                    num_cards=2,
                    deck_id=self.deck.id,
                    difficulty="easy",
                )

                # Verify response structure
                assert "data" in result
                assert "cards" in result["data"]
                assert result["data"]["preview"] is True
                assert result["data"]["source"] == "pdf"

                # Verify cards
                cards = result["data"]["cards"]
                assert len(cards) >= 1  # Sometimes AI might generate fewer cards

                for card in cards:
                    assert "question" in card
                    assert "answer" in card
                    assert "difficulty_level" in card
                    assert card["difficulty_level"] == "easy"

                # Verify metadata
                metadata = result["data"]["metadata"]
                assert metadata["difficulty"] == "easy"
                assert metadata["file_name"] == "data_science_intro.pdf"

                print(f"✅ Generated {len(cards)} cards from PDF")
                for i, card in enumerate(cards, 1):
                    print(f"Card {i}: {card['question']}")

            finally:
                # Cleanup
                if os.path.exists(pdf_path):
                    os.unlink(pdf_path)

    @pytest.mark.skipif(
        not os.getenv("GEMINI_API_KEY")
        or os.getenv("GEMINI_API_KEY") == "your_gemini_api_key_here",
        reason="GEMINI_API_KEY not set or is placeholder",
    )
    def test_generate_insights_from_user_query(self, app):
        """Test 3: Generate insights based on user query and study data"""
        with app.app_context():
            ai_service = AIService()

            # Test different types of queries
            test_queries = [
                "How am I doing with my studies?",
                "What should I focus on next?",
                "Which topics am I struggling with?",
            ]

            for query in test_queries:
                result = ai_service.ai_chat_with_budget(
                    user_query=query, user_id=self.user.id, max_context_tokens=1500
                )

                # Verify response structure
                assert "data" in result
                assert "query" in result["data"]
                assert "response" in result["data"]
                assert "conversation_id" in result["data"]

                # Verify content
                assert result["data"]["query"] == query
                assert len(result["data"]["response"]) > 0
                assert isinstance(result["data"]["conversation_id"], int)

                # Verify conversation was saved to database
                from models.ai import AIConversation

                conversation = AIConversation.query.get(
                    result["data"]["conversation_id"]
                )
                assert conversation is not None
                assert conversation.user_id == self.user.id
                assert conversation.user_query == query
                assert conversation.ai_response == result["data"]["response"]

                print(f"✅ Generated insights for query: '{query}'")
                print(f"Response preview: {result['data']['response'][:100]}...")

    def test_context_creation_utilities(self, app):
        """Test context creation utilities (no API calls needed)"""
        with app.app_context():
            # Test compressed context creation
            context = AIService.create_compressed_context(
                user_id=self.user.id, max_tokens=1000
            )

            # Verify context structure
            assert "recent_struggles" in context
            assert "mastered_topics" in context
            assert "study_stats" in context
            assert "focus_areas" in context

            # Test study stats
            stats = AIService.get_key_metrics(self.user.id)
            assert "total_reviews" in stats
            assert "avg_score" in stats
            assert "total_cards" in stats
            assert stats["total_reviews"] == 2
            assert stats["total_cards"] == 1

    def test_error_handling(self, app):
        """Test error handling for AI service"""
        with app.app_context():
            ai_service = AIService()

            # Test with invalid deck_id
            with pytest.raises(ValueError, match="Deck not found"):
                ai_service.generate_cards_from_text(
                    content="Test content",
                    num_cards=1,
                    deck_id=99999,  # Non-existent deck
                    difficulty="easy",
                )

            # Test with empty content
            with pytest.raises(ValueError):
                ai_service.generate_cards_from_text(
                    content="", num_cards=1, deck_id=self.deck.id, difficulty="easy"
                )


if __name__ == "__main__":
    print("Run with: pytest backend/tests/test_ai_service.py -v")
