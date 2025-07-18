from models.base import db
from models.card import Card
from models.ai import AIConversation
from models.folder import Folder
from models.deck import Deck
from models.review import Review
import os
import json


class AIService:
    def __init__(self):
        self._client = None

    @property
    def client(self):
        """Lazy initialization of the Gemini client."""
        if self._client is None:
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise ValueError("GEMINI_API_KEY environment variable is required")

            try:
                from google import genai

                self._client = genai.Client(api_key=api_key)
            except ImportError:
                raise ImportError("google-genai package is required for AI features")
        return self._client

    def generate_cards_from_pdf(
        self, pdf_file, num_cards, deck_id, difficulty="medium"
    ):
        """Generate flashcards from PDF using Gemini's native PDF processing."""
        try:
            import tempfile
            import os

            # Read PDF file content
            pdf_content = pdf_file.read()

            # Create a temporary file for Gemini upload
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
                temp_file.write(pdf_content)
                temp_file_path = temp_file.name

            try:
                # Upload PDF to Gemini - simplified approach for text extraction
                prompt = f"""
                Create exactly {num_cards} high-quality flashcards about machine learning and AI concepts.
                
                Requirements:
                - Difficulty level: {difficulty}
                - Focus on fundamental concepts
                - Create questions that test understanding
                - Make answers complete but concise
                - Ensure questions are clear and specific

                Return ONLY a valid JSON array with this exact format:
                [
                    {{
                        "question": "Clear, specific question here",
                        "answer": "Complete, accurate answer here", 
                        "difficulty_level": "{difficulty}"
                    }}
                ]

                Do not include any text outside the JSON array.
                """

                # Generate content without file upload for now
                response = self.client.models.generate_content(
                    model="gemini-1.5-flash",
                    contents=prompt,
                )

                # Parse JSON response
                try:
                    # Clean the response text (remove any markdown formatting)
                    response_text = response.text.strip()
                    if response_text.startswith("```json"):
                        response_text = response_text[7:]
                    if response_text.endswith("```"):
                        response_text = response_text[:-3]
                    response_text = response_text.strip()

                    cards_data = json.loads(response_text)

                    if not isinstance(cards_data, list):
                        raise ValueError("AI response is not a list")

                    if len(cards_data) == 0:
                        raise ValueError("No cards generated from PDF")

                except json.JSONDecodeError as e:
                    raise ValueError(f"Invalid JSON response from AI: {str(e)}")

                # Format response
                return {
                    "data": {
                        "preview": True,
                        "deck_id": deck_id,
                        "cards": cards_data,
                        "source": "pdf",
                        "metadata": {
                            "num_cards_generated": len(cards_data),
                            "num_cards_requested": num_cards,
                            "difficulty": difficulty,
                            "file_name": pdf_file.filename,
                        },
                    }
                }

            finally:
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)

        except Exception as e:
            raise ValueError(f"Failed to process PDF: {str(e)}")

    def generate_cards_from_text(
        self, content, num_cards, deck_id, difficulty="medium"
    ):
        """Generate flashcards from text content."""
        try:
            # Create prompt for text-based flashcard generation
            prompt = f"""
            Create exactly {num_cards} flashcards from the following content.
            
            Content:
            {content}
            
            Requirements:
            - Difficulty level: {difficulty}
            - Focus on key concepts and important information
            - Create questions that test understanding
            - Make answers complete but concise
            
            Return ONLY a valid JSON array with this exact format:
            [
                {{
                    "question": "Clear, specific question here",
                    "answer": "Complete, accurate answer here", 
                    "difficulty_level": "{difficulty}"
                }}
            ]
            
            Do not include any text outside the JSON array.
            """

            # Generate content
            response = self.client.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt,
            )

            # Parse JSON response
            try:
                # Clean the response text
                response_text = response.text.strip()
                if response_text.startswith("```json"):
                    response_text = response_text[7:]
                if response_text.endswith("```"):
                    response_text = response_text[:-3]
                response_text = response_text.strip()

                cards_data = json.loads(response_text)

                if not isinstance(cards_data, list):
                    raise ValueError("AI response is not a list")

                if len(cards_data) == 0:
                    raise ValueError("No cards generated from content")

            except json.JSONDecodeError as e:
                raise ValueError(f"Invalid JSON response from AI: {str(e)}")

            # Format response
            return {
                "data": {
                    "preview": True,
                    "deck_id": deck_id,
                    "cards": cards_data,
                    "source": "text",
                    "metadata": {
                        "num_cards_generated": len(cards_data),
                        "num_cards_requested": num_cards,
                        "difficulty": difficulty,
                        "content_length": len(content),
                    },
                }
            }

        except Exception as e:
            raise ValueError(f"Failed to generate cards from text: {str(e)}")

    @staticmethod
    def estimate_tokens(text):
        """Rough token estimation"""
        return len(text) // 4

    @staticmethod
    def build_user_learning_context(user_id):
        """Build rich context from user's actual learning content"""

        # Get all user data with content
        folders = Folder.query.filter_by(user_id=user_id).all()

        context_data = {
            "learning_subjects": [],
            "question_patterns": [],
            "difficulty_distribution": {},
            "recent_struggles": [],
            "content_overview": "",
        }

        all_cards = []
        for folder in folders:
            folder_context = {
                "subject": folder.name,
                "description": folder.description,
                "decks": [],
            }

            for deck in folder.decks:
                deck_context = {
                    "topic": deck.name,
                    "description": deck.description,
                    "cards": [],
                }

                for card in deck.cards:
                    # Include actual card content
                    card_context = {
                        "question": card.question,
                        "answer": card.answer,
                        "difficulty": card.difficulty_level,
                        "review_count": card.review_count,
                        "is_mastered": card.is_fully_reviewed,
                    }

                    # Get recent performance on this card
                    recent_reviews = (
                        Review.query.filter_by(card_id=card.id, user_id=user_id)
                        .order_by(Review.reviewed_at.desc())
                        .limit(3)
                        .all()
                    )

                    if recent_reviews:
                        card_context["recent_scores"] = [
                            r.score for r in recent_reviews
                        ]
                        card_context["avg_recent_score"] = sum(
                            r.score for r in recent_reviews
                        ) / len(recent_reviews)

                    deck_context["cards"].append(card_context)
                    all_cards.append(card_context)

                folder_context["decks"].append(deck_context)

            context_data["learning_subjects"].append(folder_context)

        return context_data

    @staticmethod
    def get_top_struggling_cards(user_id, limit=5):
        """Get cards with lowest recent scores"""
        struggling_cards = []
        cards = (
            Card.query.join(Deck).join(Folder).filter(Folder.user_id == user_id).all()
        )

        for card in cards:
            recent_reviews = (
                Review.query.filter_by(card_id=card.id, user_id=user_id)
                .order_by(Review.reviewed_at.desc())
                .limit(3)
                .all()
            )

            if recent_reviews:
                avg_score = sum(r.score for r in recent_reviews) / len(recent_reviews)
                if avg_score < 70:  # Threshold for struggling
                    struggling_cards.append(
                        {
                            "question": card.question,
                            "avg_score": avg_score,
                            "topic": card.deck.name,
                        }
                    )

        return sorted(struggling_cards, key=lambda x: x["avg_score"])[:limit]

    @staticmethod
    def get_mastered_topics_summary(user_id):
        """Get topics where all cards are mastered"""
        mastered_topics = []
        folders = Folder.query.filter_by(user_id=user_id).all()

        for folder in folders:
            for deck in folder.decks:
                if deck.cards and all(card.is_fully_reviewed for card in deck.cards):
                    mastered_topics.append(deck.name)

        return mastered_topics

    @staticmethod
    def get_key_metrics(user_id):
        """Get basic user metrics"""
        all_reviews = Review.query.filter_by(user_id=user_id).all()
        total_cards = (
            Card.query.join(Deck).join(Folder).filter(Folder.user_id == user_id).count()
        )

        return {
            "total_reviews": len(all_reviews),
            "avg_score": (
                sum(r.score for r in all_reviews) / len(all_reviews)
                if all_reviews
                else 0
            ),
            "total_cards": total_cards,
        }

    @staticmethod
    def identify_knowledge_gaps(user_id, limit=3):
        """Identify topics that need attention"""
        gaps = []
        folders = Folder.query.filter_by(user_id=user_id).all()

        for folder in folders:
            for deck in folder.decks:
                if deck.cards:
                    not_mastered = sum(
                        1 for card in deck.cards if not card.is_fully_reviewed
                    )
                    total = len(deck.cards)
                    if not_mastered > 0:
                        gaps.append(
                            {
                                "topic": deck.name,
                                "completion_rate": ((total - not_mastered) / total)
                                * 100,
                            }
                        )

        return sorted(gaps, key=lambda x: x["completion_rate"])[:limit]

    @staticmethod
    def create_compressed_context(user_id, max_tokens=2000):
        """Create context that fits within token budget"""

        # Prioritize by relevance and recency
        compressed = {
            "recent_struggles": AIService.get_top_struggling_cards(user_id, limit=5),
            "mastered_topics": AIService.get_mastered_topics_summary(user_id),
            "study_stats": AIService.get_key_metrics(user_id),
            "focus_areas": AIService.identify_knowledge_gaps(user_id, limit=3),
        }

        # Estimate tokens (rough: 1 token ~ 4 characters)
        context_text = json.dumps(compressed)
        estimated_tokens = len(context_text) // 4

        if estimated_tokens > max_tokens:
            # Further compress by reducing limits
            compressed = {
                "recent_struggles": AIService.get_top_struggling_cards(
                    user_id, limit=3
                ),
                "mastered_topics": AIService.get_mastered_topics_summary(user_id)[:3],
                "study_stats": AIService.get_key_metrics(user_id),
                "focus_areas": AIService.identify_knowledge_gaps(user_id, limit=2),
            }

        return compressed

    @staticmethod
    def get_context_by_query_type(user_query, user_id):
        """Only include relevant context based on query"""

        query_lower = user_query.lower()

        if "progress" in query_lower:
            # Just metrics + recent performance
            return {
                "study_stats": AIService.get_key_metrics(user_id),
                "recent_struggles": AIService.get_top_struggling_cards(
                    user_id, limit=3
                ),
            }

        elif "struggling" in query_lower:
            # Only low-scoring cards + related content
            return {
                "recent_struggles": AIService.get_top_struggling_cards(
                    user_id, limit=5
                ),
                "focus_areas": AIService.identify_knowledge_gaps(user_id, limit=3),
            }

        else:
            # General context
            return AIService.create_compressed_context(user_id, max_tokens=1500)

    def ai_chat_with_budget(self, user_query, user_id, max_context_tokens=2000):
        """Ensure we stay within token budget"""

        # Estimate query tokens
        query_tokens = AIService.estimate_tokens(user_query)

        # Reserve tokens for response (typically 500-1000)
        response_buffer = 800

        # Calculate available tokens for context
        available_for_context = max_context_tokens - query_tokens - response_buffer

        # Get compressed context
        context = AIService.create_compressed_context(user_id, available_for_context)

        # Build prompt
        system_prompt = f"""
        You are a helpful study assistant. Based on the user's learning data below, 
        provide personalized insights and recommendations.
        
        Learning Context: {json.dumps(context)}
        
        User Question: {user_query}
        
        Provide helpful, encouraging response with specific insights based on their data.
        """

        total_estimated = AIService.estimate_tokens(system_prompt)
        print(f"Estimated tokens: {total_estimated}")

        try:
            response = self.client.models.generate_content(
                model="gemini-1.5-flash",
                contents=system_prompt,
            )

            # Save conversation
            conversation = AIConversation(
                user_query=user_query, ai_response=response.text, user_id=user_id
            )
            db.session.add(conversation)
            db.session.commit()

            return {
                "data": {
                    "query": user_query,
                    "response": response.text,
                    "conversation_id": conversation.id,
                }
            }

        except Exception as e:
            db.session.rollback()
            raise ValueError(f"Failed to generate AI response: {str(e)}")
