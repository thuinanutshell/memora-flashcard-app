from flask import Flask, Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Folder, Deck, Card, Review
from services.review_service import ReviewService
from datetime import datetime, timedelta
from sentence_transformers import SentenceTransformer, util

review_bp = Blueprint("review", __name__)


def semantic_similarity(user_answer, correct_answer):
    model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = model.encode([user_answer.strip(), correct_answer.strip()])
    similarity = util.cos_sim(embeddings[0], embeddings[1])
    return float(similarity) * 100


# Add a review event for a card to the database
@review_bp.route("/<int:card_id>", methods=["POST"])
@jwt_required()
def submit_review(card_id):
    current_user_id = get_jwt_identity()

    # Verify card ownership
    card = (
        Card.query.join(Deck)
        .join(Folder)
        .filter(Card.id == card_id, Folder.user_id == current_user_id)
        .first()
    )
    if not card:
        return jsonify({"error": "Card not found"}), 404

    data = request.get_json()
    user_answer = data.get("answer")

    # Compute the score of user's input
    score = semantic_similarity(user_answer, card.answer)
    note = data.get("note")

    # Update card review tracking
    card.review_count += 1
    card.last_reviewed = datetime.utcnow()

    # Calculate next review date or mark as fully reviewed
    if card.review_count >= ReviewService.REQUIRED_REVIEWS:
        card.is_fully_reviewed = True
        card.next_review_at = None  # no more scheduled reviews are needed
    else:
        card.next_review_at = ReviewService.calculate_next_review_date(card)

    review = Review(
        card_id=card_id, reviewed_at=datetime.utcnow(), score=float(score), note=note
    )

    db.session.add(review)
    db.session.commit()

    response_data = {
        "message": "Review recorded successfully",
        "review_stage": ReviewService.get_review_stage(card.review_count),
        "reviews_completed": card.review_count,
        "reviews_remaining": max(0, ReviewService.REQUIRED_REVIEWS - card.review_count),
        "is_fully_reviewed": card.is_fully_reviewed,
    }

    if not card.is_fully_reviewed:
        response_data["next_review_date"] = card.next_review_at.isoformat()

    return jsonify(response_data), 201


@review_bp.route("/optional/<int:card_id>", methods=["POST"])
@jwt_required()
def add_optional_review(card_id):
    """For reviewing fully reviewed cards (optional reviews)"""
    current_user_id = get_jwt_identity()

    # Verify card ownership
    card = (
        Card.query.join(Deck)
        .join(Folder)
        .filter(Card.id == card_id, Folder.user_id == current_user_id)
        .first()
    )

    if not card:
        return jsonify({"error": "Card not found"}), 404

    if not card.is_fully_reviewed:
        return (
            jsonify(
                {
                    "error": "Card is not fully reviewed yet. Use regular review endpoint."
                }
            ),
            400,
        )

    data = request.get_json()
    score = data.get("score")
    note = data.get("note")

    if score is None or not (0 <= score <= 100):
        return jsonify({"error": "Score must be a percentage between 0 and 100"}), 400

    # Update last reviewed time only (don't change review_count or next_review_at)
    card.last_reviewed = datetime.utcnow()

    # Create review record
    review = Review(
        card_id=card_id, reviewed_at=datetime.utcnow(), score=float(score), note=note
    )

    db.session.add(review)
    db.session.commit()

    return (
        jsonify(
            {
                "message": "Optional review recorded successfully",
                "review_stage": "Optional Review",
                "total_reviews": card.review_count
                + len([r for r in card.reviews]),  # Include optional reviews
            }
        ),
        201,
    )


@review_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def get_dashboard_stats():
    current_user_id = get_jwt_identity()

    # Cards due for review (not fully reviewed and past due date)
    cards_due = ReviewService.get_cards_due_for_review(current_user_id)

    # Cards by review stage
    new_cards = (
        Card.query.join(Deck)
        .join(Folder)
        .filter(Folder.user_id == current_user_id, Card.review_count == 0)
        .count()
    )

    first_review_cards = (
        Card.query.join(Deck)
        .join(Folder)
        .filter(Folder.user_id == current_user_id, Card.review_count == 1)
        .count()
    )

    second_review_cards = (
        Card.query.join(Deck)
        .join(Folder)
        .filter(Folder.user_id == current_user_id, Card.review_count == 2)
        .count()
    )

    fully_reviewed_cards = (
        Card.query.join(Deck)
        .join(Folder)
        .filter(Folder.user_id == current_user_id, Card.is_fully_reviewed == True)
        .count()
    )

    # Recent performance (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_reviews = (
        Review.query.join(Card)
        .join(Deck)
        .join(Folder)
        .filter(
            Folder.user_id == current_user_id, Review.reviewed_at >= thirty_days_ago
        )
        .all()
    )

    avg_score = (
        sum(r.score for r in recent_reviews) / len(recent_reviews)
        if recent_reviews
        else 0
    )

    return (
        jsonify(
            {
                "cards_due_today": len(cards_due),
                "cards_by_stage": {
                    "new": new_cards,
                    "first_review": first_review_cards,
                    "second_review": second_review_cards,
                    "fully_reviewed": fully_reviewed_cards,
                },
                "recent_performance": {
                    "average_score": round(avg_score, 1),
                    "total_reviews": len(recent_reviews),
                },
            }
        ),
        200,
    )


@review_bp.route("/stats/deck/<int:deck_id>", methods=["GET"])
@jwt_required()
def get_deck_stats(deck_id):
    """Get statistics for a specific deck"""
    current_user_id = get_jwt_identity()

    # Verify deck ownership
    deck = (
        Deck.query.join(Folder)
        .filter(Deck.id == deck_id, Folder.user_id == current_user_id)
        .first()
    )

    if not deck:
        return jsonify({"error": "Deck not found"}), 404

    # Get cards by review stage for this deck
    cards_by_stage = {}
    for stage in range(4):  # 0, 1, 2, 3+
        if stage < 3:
            count = Card.query.filter_by(deck_id=deck_id, review_count=stage).count()
            stage_name = ReviewService.get_review_stage(stage)
        else:
            count = Card.query.filter_by(
                deck_id=deck_id, is_fully_reviewed=True
            ).count()
            stage_name = "Fully Reviewed"

        cards_by_stage[stage_name.lower().replace(" ", "_")] = count

    # Cards due in this deck
    cards_due = [
        card
        for card in ReviewService.get_cards_due_for_review(current_user_id)
        if card.deck_id == deck_id
    ]

    # Average score for this deck
    deck_reviews = Review.query.join(Card).filter(Card.deck_id == deck_id).all()

    avg_score = (
        sum(r.score for r in deck_reviews) / len(deck_reviews) if deck_reviews else 0
    )

    return (
        jsonify(
            {
                "deck_name": deck.name,
                "cards_due": len(cards_due),
                "cards_by_stage": cards_by_stage,
                "average_score": round(avg_score, 1),
                "total_reviews": len(deck_reviews),
            }
        ),
        200,
    )
