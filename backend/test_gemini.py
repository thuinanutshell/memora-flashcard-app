import os
import sys
from pathlib import Path

# Add the backend directory to path
sys.path.append(str(Path(__file__).parent))

from dotenv import load_dotenv

load_dotenv()

from services.ai_service import AIService


def test_single_card():
    """Test generating one flashcard from text"""
    print("Testing Gemini API - Generate 1 Card")
    print("=" * 40)

    # Check if API key is set
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY not set in .env file")
        print("Please add: GEMINI_API_KEY=your_actual_api_key")
        return

    ai_service = AIService()

    test_content = """
    React is a JavaScript library for building user interfaces. 
    It was created by Facebook and is now maintained by Meta. 
    React uses a component-based architecture where you build 
    encapsulated components that manage their own state.
    """

    try:
        print("📝 Content:")
        print(test_content.strip())
        print("\n🤖 Generating flashcard...")

        # Generate 1 card
        result = ai_service.generate_cards_from_text(
            content=test_content,
            num_cards=1,
            deck_id=1,  # Dummy deck ID for testing
            difficulty="medium",
        )

        print("✅ SUCCESS!")
        print("\n" + "=" * 40)

        card = result["data"]["cards"][0]
        print(f"📚 FLASHCARD")
        print(f"Question: {card['question']}")
        print(f"Answer: {card['answer']}")
        print(f"Difficulty: {card['difficulty_level']}")
        print("=" * 40)

        print(f"\n📊 Generation successful!")
        print(f"- Cards generated: {len(result['data']['cards'])}")
        print(f"- Source: {result['data']['source']}")

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        print("\nPossible issues:")
        print("1. Check your GEMINI_API_KEY in .env")
        print("2. Make sure you have internet connection")
        print("3. Verify your Google AI API quota")


if __name__ == "__main__":
    test_single_card()
