from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.ai_service import AIService

bp_ai = Blueprint("ai", __name__)


def get_ai_service():
    """Get AI service instance with proper error handling."""
    try:
        return AIService()
    except (ValueError, ImportError) as e:
        return None


@bp_ai.route("/chat", methods=["POST"])
@jwt_required()
def ai_chat():
    """
    Chat with AI for study insights and recommendations.

    Request Body:
    {
        "query": "How am I doing with my studies?",
        "context_level": "detailed" | "summary" (optional, default: "summary")
    }

    Returns:
    - AI response with personalized insights
    - Conversation ID for reference
    """
    try:
        ai_service = get_ai_service()
        if not ai_service:
            return (
                jsonify(
                    {
                        "error": "AI service is not available. Please check configuration."
                    }
                ),
                503,
            )

        user_id = get_jwt_identity()

        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400

        data = request.get_json()

        if not data or "query" not in data:
            return jsonify({"error": "Query is required"}), 400

        user_query = data["query"].strip()
        if not user_query:
            return jsonify({"error": "Query cannot be empty"}), 400

        context_level = data.get("context_level", "summary")
        if context_level not in ["detailed", "summary"]:
            return (
                jsonify({"error": "context_level must be 'detailed' or 'summary'"}),
                400,
            )

        # Adjust token budget based on context level
        max_tokens = 3000 if context_level == "detailed" else 2000

        result = ai_service.ai_chat_with_budget(user_query, user_id, max_tokens)

        return (
            jsonify(
                {
                    "message": "AI response generated successfully",
                    "data": result["data"],
                }
            ),
            200,
        )

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Failed to generate AI response"}), 500


@bp_ai.route("/generate-cards-from-pdf", methods=["POST"])
@jwt_required()
def generate_flashcards_from_pdf():
    """
    Generate flashcards from uploaded PDF file using Gemini's native PDF processing.

    Form Data:
    - file: PDF file (multipart/form-data)
    - deck_id: Target deck ID
    - num_cards: Number of cards to generate (1-20)
    - difficulty: easy/medium/hard (optional, default: medium)

    Returns:
    - Generated flashcards (preview mode)
    - User can review and accept via /ai/accept-cards
    """
    try:
        ai_service = get_ai_service()
        if not ai_service:
            return (
                jsonify(
                    {
                        "error": "AI service is not available. Please check configuration."
                    }
                ),
                503,
            )

        user_id = get_jwt_identity()

        # Check if file is present
        if "file" not in request.files:
            return jsonify({"error": "No PDF file uploaded"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        # Validate file type
        if not file.filename.lower().endswith(".pdf"):
            return jsonify({"error": "Only PDF files are allowed"}), 400

        # Check file size (limit to 10MB for Gemini)
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Seek back to beginning

        if file_size > 10 * 1024 * 1024:  # 10MB limit
            return jsonify({"error": "PDF file size must be less than 10MB"}), 400

        # Get form data
        deck_id = request.form.get("deck_id", type=int)
        num_cards = request.form.get("num_cards", default=5, type=int)
        difficulty = request.form.get("difficulty", "medium")

        # Validate form data
        if not deck_id:
            return jsonify({"error": "deck_id is required"}), 400

        if num_cards < 1 or num_cards > 20:
            return jsonify({"error": "num_cards must be between 1 and 20"}), 400

        if difficulty not in ["easy", "medium", "hard"]:
            return (
                jsonify({"error": "difficulty must be 'easy', 'medium', or 'hard'"}),
                400,
            )

        # Verify deck ownership
        from services.crud_service import CRUDService

        try:
            deck = CRUDService.get_one_deck(deck_id, user_id)
        except ValueError:
            return jsonify({"error": "Deck not found or access denied"}), 404

        # Process PDF with Gemini
        result = ai_service.generate_cards_from_pdf(
            file, num_cards, deck_id, difficulty
        )

        return (
            jsonify(
                {
                    "message": f"Generated {len(result['data']['cards'])} flashcards from PDF successfully",
                    "data": result["data"],
                }
            ),
            200,
        )

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Failed to process PDF"}), 500


@bp_ai.route("/generate-cards", methods=["POST"])
@jwt_required()
def generate_flashcards():
    """
    Generate flashcards from text content

    Request Body:
    {
        "content": "Text content to generate cards from",
        "deck_id": 123,
        "num_cards": 5,
        "difficulty": "medium" (optional)
    }

    Returns:
    - Generated flashcards (preview)
    - User can accept/reject before saving
    """
    try:
        ai_service = get_ai_service()
        if not ai_service:
            return (
                jsonify(
                    {
                        "error": "AI service is not available. Please check configuration."
                    }
                ),
                503,
            )

        user_id = get_jwt_identity()

        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400

        data = request.get_json()

        # Validate required fields
        required_fields = ["content", "deck_id", "num_cards"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"{field} is required"}), 400

        content = data["content"].strip()
        deck_id = data["deck_id"]
        num_cards = data["num_cards"]
        difficulty = data.get("difficulty", "medium")

        # Validate inputs
        if not content:
            return jsonify({"error": "Content cannot be empty"}), 400

        if not isinstance(deck_id, int) or deck_id <= 0:
            return jsonify({"error": "deck_id must be a positive integer"}), 400

        if not isinstance(num_cards, int) or num_cards < 1 or num_cards > 20:
            return jsonify({"error": "num_cards must be between 1 and 20"}), 400

        if difficulty not in ["easy", "medium", "hard"]:
            return (
                jsonify({"error": "difficulty must be 'easy', 'medium', or 'hard'"}),
                400,
            )

        # Verify deck ownership
        from services.crud_service import CRUDService

        try:
            CRUDService.get_one_deck(deck_id, user_id)
        except ValueError:
            return jsonify({"error": "Deck not found or access denied"}), 404

        # Generate cards from text
        result = ai_service.generate_cards_from_text(
            content, num_cards, deck_id, difficulty
        )

        return (
            jsonify(
                {
                    "message": f"Generated {len(result['data']['cards'])} flashcards successfully",
                    "data": result["data"],
                }
            ),
            200,
        )

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Failed to generate flashcards"}), 500


@bp_ai.route("/accept-cards", methods=["POST"])
@jwt_required()
def accept_generated_cards():
    """
    Accept and save AI-generated flashcards to deck.

    Request Body:
    {
        "deck_id": 123,
        "cards": [
            {
                "question": "What is...",
                "answer": "It is...",
                "difficulty_level": "medium"
            }
        ]
    }

    Returns:
    - Saved card IDs
    - Success confirmation
    """
    try:
        user_id = get_jwt_identity()

        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400

        data = request.get_json()

        if "deck_id" not in data or "cards" not in data:
            return jsonify({"error": "deck_id and cards are required"}), 400

        deck_id = data["deck_id"]
        cards = data["cards"]

        if not isinstance(cards, list) or len(cards) == 0:
            return jsonify({"error": "cards must be a non-empty list"}), 400

        if len(cards) > 20:
            return jsonify({"error": "Cannot save more than 20 cards at once"}), 400

        # Verify deck ownership
        from services.crud_service import CRUDService

        try:
            CRUDService.get_one_deck(deck_id, user_id)
        except ValueError:
            return jsonify({"error": "Deck not found or access denied"}), 404

        # Save each card using CRUD service
        saved_cards = []
        failed_cards = []

        for i, card_data in enumerate(cards):
            try:
                # Validate card data
                required_fields = ["question", "answer", "difficulty_level"]
                for field in required_fields:
                    if field not in card_data or not card_data[field]:
                        raise ValueError(f"Card {i+1}: {field} is required")

                # Save card
                result = CRUDService.add_new_card(card_data, deck_id, user_id)
                saved_cards.append(
                    {
                        "index": i + 1,
                        "card_id": result["data"]["id"],
                        "question": result["data"]["question"],
                    }
                )

            except Exception as e:
                failed_cards.append(
                    {
                        "index": i + 1,
                        "error": str(e),
                        "question": card_data.get("question", "Unknown"),
                    }
                )

        response_data = {
            "saved_count": len(saved_cards),
            "failed_count": len(failed_cards),
            "saved_cards": saved_cards,
        }

        if failed_cards:
            response_data["failed_cards"] = failed_cards

        status_code = 201 if len(saved_cards) > 0 else 400
        message = f"Saved {len(saved_cards)} cards successfully"
        if failed_cards:
            message += f", {len(failed_cards)} failed"

        return jsonify({"message": message, "data": response_data}), status_code

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Failed to save generated cards"}), 500


@bp_ai.route("/conversations", methods=["GET"])
@jwt_required()
def get_conversation_history():
    """
    Get user's AI conversation history.

    Query Parameters:
    - limit: Number of conversations to return (default: 10, max: 50)
    - offset: Number of conversations to skip (default: 0)

    Returns:
    - List of recent conversations
    - Pagination info
    """
    try:
        user_id = get_jwt_identity()

        limit = request.args.get("limit", default=10, type=int)
        offset = request.args.get("offset", default=0, type=int)

        if limit < 1 or limit > 50:
            return jsonify({"error": "limit must be between 1 and 50"}), 400

        if offset < 0:
            return jsonify({"error": "offset must be non-negative"}), 400

        # Get conversations from database
        from models import AIConversation

        conversations = (
            AIConversation.query.filter_by(user_id=user_id)
            .order_by(AIConversation.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

        # Get total count for pagination
        total_count = AIConversation.query.filter_by(user_id=user_id).count()

        conversation_list = [
            {
                "id": conv.id,
                "query": (
                    conv.user_query[:100] + "..."
                    if len(conv.user_query) > 100
                    else conv.user_query
                ),
                "response_preview": (
                    conv.ai_response[:200] + "..."
                    if len(conv.ai_response) > 200
                    else conv.ai_response
                ),
                "created_at": conv.created_at.isoformat(),
            }
            for conv in conversations
        ]

        return (
            jsonify(
                {
                    "message": "Conversation history retrieved successfully",
                    "data": {
                        "conversations": conversation_list,
                        "pagination": {
                            "total": total_count,
                            "limit": limit,
                            "offset": offset,
                            "has_more": offset + limit < total_count,
                        },
                    },
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": "Failed to retrieve conversation history"}), 500


@bp_ai.route("/conversation/<int:conversation_id>", methods=["GET"])
@jwt_required()
def get_conversation_detail(conversation_id):
    """
    Get full details of a specific conversation.

    Args:
        conversation_id: ID of the conversation

    Returns:
    - Full conversation details
    - User query and AI response
    """
    try:
        user_id = get_jwt_identity()

        from models import AIConversation

        conversation = AIConversation.query.filter_by(
            id=conversation_id, user_id=user_id
        ).first()

        if not conversation:
            return jsonify({"error": "Conversation not found"}), 404

        conversation_data = {
            "id": conversation.id,
            "user_query": conversation.user_query,
            "ai_response": conversation.ai_response,
            "created_at": conversation.created_at.isoformat(),
            "updated_at": (
                conversation.updated_at.isoformat() if conversation.updated_at else None
            ),
        }

        return (
            jsonify(
                {
                    "message": "Conversation details retrieved successfully",
                    "data": conversation_data,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": "Failed to retrieve conversation details"}), 500


@bp_ai.route("/suggestions", methods=["GET"])
@jwt_required()
def get_study_suggestions():
    """
    Get AI-powered study suggestions based on user's performance.

    Query Parameters:
    - type: 'quick' | 'detailed' (default: 'quick')

    Returns:
    - Personalized study recommendations
    - Focus areas and next steps
    """
    try:
        user_id = get_jwt_identity()
        suggestion_type = request.args.get("type", "quick")

        if suggestion_type not in ["quick", "detailed"]:
            return jsonify({"error": "type must be 'quick' or 'detailed'"}), 400

        # Generate suggestions based on user data
        if suggestion_type == "quick":
            # Get quick suggestions using compressed context
            context = AIService.create_compressed_context(user_id, max_tokens=1000)
            suggestions = {
                "type": "quick",
                "recommendations": [
                    "Review cards you've struggled with recently",
                    "Focus on your weakest topics",
                    "Maintain your study streak",
                ],
                "focus_areas": context.get("focus_areas", []),
                "recent_struggles": context.get("recent_struggles", [])[:3],
            }
        else:
            # Get detailed suggestions with more context
            context = AIService.create_compressed_context(user_id, max_tokens=2000)
            suggestions = {
                "type": "detailed",
                "study_plan": {
                    "immediate_focus": context.get("recent_struggles", [])[:2],
                    "mastered_areas": context.get("mastered_topics", [])[:3],
                    "improvement_areas": context.get("focus_areas", []),
                },
                "metrics": context.get("study_stats", {}),
                "recommendations": [
                    "Create a daily review schedule",
                    "Focus on spaced repetition for difficult cards",
                    "Set weekly learning goals",
                ],
            }

        return (
            jsonify(
                {
                    "message": f"{suggestion_type.capitalize()} study suggestions generated successfully",
                    "data": suggestions,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": "Failed to generate study suggestions"}), 500
