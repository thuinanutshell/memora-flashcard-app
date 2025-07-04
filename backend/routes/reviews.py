from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.review_service import ReviewService
from models.base import db
from models.card import Card
from models.review import Review
from models.deck import Deck
from models.folder import Folder
from sqlalchemy import desc

bp_review = Blueprint("review", __name__)


@bp_review.route("/card/<int:card_id>", methods=["POST"])
@jwt_required()
def submit_review(card_id):
    """
    Submit a review for a specific card.

    Request Body:
    {
        "answer": "User's answer to the card question"
    }

    Returns:
    - Review score (similarity percentage)
    - Next review date for the card
    - Updated card statistics
    """
    try:
        user_id = get_jwt_identity()

        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400

        review_data = request.get_json()

        if not review_data or "answer" not in review_data:
            return jsonify({"error": "Answer is required"}), 400

        if not review_data["answer"].strip():
            return jsonify({"error": "Answer cannot be empty"}), 400

        # Verify card ownership through deck -> folder -> user relationship
        card = (
            Card.query.join(Deck)
            .join(Folder)
            .filter(Card.id == card_id, Folder.user_id == user_id)
            .first()
        )

        if not card:
            return jsonify({"error": "Card not found or access denied"}), 404

        # Submit the review using the service
        result = ReviewService.submit_review(card_id, user_id, review_data)

        return (
            jsonify(
                {"message": "Review submitted successfully", "data": result["data"]}
            ),
            201,
        )

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to submit review"}), 500


@bp_review.route("/card/<int:card_id>/history", methods=["GET"])
@jwt_required()
def get_card_review_history(card_id):
    """
    Get review history for a specific card.

    Query Parameters:
    - limit: Number of reviews to return (default: 10, max: 50)

    Returns:
    - List of reviews with scores and timestamps
    - Card information
    """
    try:
        user_id = get_jwt_identity()

        # Verify card ownership
        card = (
            Card.query.join(Deck)
            .join(Folder)
            .filter(Card.id == card_id, Folder.user_id == user_id)
            .first()
        )

        if not card:
            return jsonify({"error": "Card not found or access denied"}), 404

        # Get limit parameter
        limit = min(request.args.get("limit", default=10, type=int), 50)

        # Get reviews
        reviews = (
            Review.query.filter_by(card_id=card_id, user_id=user_id)
            .order_by(desc(Review.reviewed_at))
            .limit(limit)
            .all()
        )

        # Format review data
        review_list = [
            {
                "id": review.id,
                "user_answer": review.user_answer,
                "score": round(review.score, 1),
                "reviewed_at": review.reviewed_at.isoformat(),
            }
            for review in reviews
        ]

        return (
            jsonify(
                {
                    "message": "Review history retrieved successfully",
                    "data": {
                        "card_info": {
                            "id": card.id,
                            "question": card.question,
                            "answer": card.answer,
                            "difficulty_level": card.difficulty_level,
                            "review_count": card.review_count,
                            "is_fully_reviewed": card.is_fully_reviewed,
                        },
                        "reviews": review_list,
                    },
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": "Failed to retrieve review history"}), 500
