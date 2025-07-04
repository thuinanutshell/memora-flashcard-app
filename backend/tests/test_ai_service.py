import pytest
import tempfile
import os
from dotenv import load_dotenv
from services.ai_service import AIService
from models import User, Folder, Deck
from models.base import db

# Load environment variables from .env.development
load_dotenv("../.env.development")


class TestAIServiceAPI:
    """Simple tests to verify Gemini API key works"""

    @pytest.fixture(autouse=True)
    def setup_test_data(self, app):
        """Setup minimal test data"""
        with app.app_context():
            # Create test user
            user = User(
                full_name="Test User",
                username="testuser",
                email="test@example.com",
                password_hash="dummy_hash",
            )
            db.session.add(user)
            db.session.flush()

            # Create test folder and deck
            folder = Folder(
                name="Test Subject",
                description="Test folder",
                user_id=user.id,
            )
            db.session.add(folder)
            db.session.flush()

            deck = Deck(
                name="Test Deck",
                description="Test deck",
                folder_id=folder.id,
            )
            db.session.add(deck)
            db.session.commit()

            # Store IDs instead of objects to avoid session issues
            self.user_id = user.id
            self.deck_id = deck.id

    @pytest.mark.skipif(
        not os.getenv("GEMINI_API_KEY")
        or os.getenv("GEMINI_API_KEY") == "your_gemini_api_key_here",
        reason="GEMINI_API_KEY not set or is placeholder",
    )
    def test_generate_cards_from_text(self, app):
        """Test 1: Generate flashcards from text"""
        with app.app_context():
            ai_service = AIService()

            test_content = """
            Python is a high-level programming language created by Guido van Rossum.
            It was first released in 1991 and emphasizes code readability.
            Python supports multiple programming paradigms including procedural,
            object-oriented, and functional programming.
            """

            try:
                result = ai_service.generate_cards_from_text(
                    content=test_content,
                    num_cards=2,
                    deck_id=self.deck_id,
                    difficulty="easy",
                )

                # Verify response structure
                assert "data" in result
                assert "cards" in result["data"]
                assert result["data"]["preview"] is True
                assert result["data"]["deck_id"] == self.deck_id

                # Verify cards were generated
                cards = result["data"]["cards"]
                assert len(cards) >= 1  # At least 1 card generated

                for card in cards:
                    assert "question" in card
                    assert "answer" in card
                    assert "difficulty_level" in card
                    assert len(card["question"]) > 0
                    assert len(card["answer"]) > 0

                print(f"✅ Generated {len(cards)} cards from text")
                for i, card in enumerate(cards, 1):
                    print(f"   Card {i}: {card['question'][:50]}...")

            except Exception as e:
                pytest.fail(f"Text generation failed: {str(e)}")

    @pytest.mark.skipif(
        not os.getenv("GEMINI_API_KEY")
        or os.getenv("GEMINI_API_KEY") == "your_gemini_api_key_here",
        reason="GEMINI_API_KEY not set or is placeholder",
    )
    def test_generate_cards_from_pdf(self, app):
        """Test 2: Generate flashcards from PDF"""
        reportlab = pytest.importorskip("reportlab", reason="reportlab not installed")

        with app.app_context():
            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import letter

            # Create a test PDF
            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp_file:
                pdf_path = tmp_file.name

            try:
                # Create PDF content
                c = canvas.Canvas(pdf_path, pagesize=letter)
                c.drawString(100, 750, "Machine Learning Introduction")
                c.drawString(
                    100, 720, "Machine learning is a subset of artificial intelligence."
                )
                c.drawString(
                    100,
                    690,
                    "It enables computers to learn from data without explicit programming.",
                )
                c.drawString(
                    100,
                    660,
                    "Common algorithms include linear regression and decision trees.",
                )
                c.drawString(
                    100,
                    630,
                    "Applications include image recognition, natural language processing.",
                )
                c.save()

                # Mock file object
                class MockPDFFile:
                    def __init__(self, file_path, filename):
                        self.file_path = file_path
                        self.filename = filename

                    def read(self):
                        with open(self.file_path, "rb") as f:
                            return f.read()

                mock_pdf = MockPDFFile(pdf_path, "ml_intro.pdf")
                ai_service = AIService()

                result = ai_service.generate_cards_from_pdf(
                    pdf_file=mock_pdf,
                    num_cards=2,
                    deck_id=self.deck_id,
                    difficulty="medium",
                )

                # Verify response structure
                assert "data" in result
                assert "cards" in result["data"]
                assert result["data"]["source"] == "pdf"

                # Verify cards
                cards = result["data"]["cards"]
                assert len(cards) >= 1

                for card in cards:
                    assert "question" in card
                    assert "answer" in card
                    assert "difficulty_level" in card

                print(f"✅ Generated {len(cards)} cards from PDF")
                for i, card in enumerate(cards, 1):
                    print(f"   Card {i}: {card['question'][:50]}...")

            except Exception as e:
                pytest.fail(f"PDF generation failed: {str(e)}")
            finally:
                # Cleanup
                if os.path.exists(pdf_path):
                    os.unlink(pdf_path)

    @pytest.mark.skipif(
        not os.getenv("GEMINI_API_KEY")
        or os.getenv("GEMINI_API_KEY") == "your_gemini_api_key_here",
        reason="GEMINI_API_KEY not set or is placeholder",
    )
    def test_ai_chat_insights(self, app):
        """Test 3: AI chat for study insights"""
        with app.app_context():
            ai_service = AIService()

            test_query = "How am I doing with my studies?"

            try:
                result = ai_service.ai_chat_with_budget(
                    user_query=test_query,
                    user_id=self.user_id,
                    max_context_tokens=1000,
                )

                # Verify response structure
                assert "data" in result
                assert "query" in result["data"]
                assert "response" in result["data"]
                assert "conversation_id" in result["data"]

                # Verify content
                assert result["data"]["query"] == test_query
                assert len(result["data"]["response"]) > 0
                assert isinstance(result["data"]["conversation_id"], int)

                print(f"✅ AI chat response generated successfully")
                print(f"   Preview: {result['data']['response'][:100]}...")

            except Exception as e:
                pytest.fail(f"AI chat failed: {str(e)}")


if __name__ == "__main__":
    print("Run with: pytest backend/tests/test_ai_service.py::TestAIServiceAPI -v")