from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models import db, Deck, Card, Review, Folder
from datetime import datetime, timedelta
from backend.services.review_service import ReviewService


card_bp = Blueprint("card", __name__)


@card_bp.route("/<int:deck_id>", methods=["POST"])
@jwt_required()
def add_card(deck_id):
    """Logic to create a new card"""
    # Verify ownership of the card
    current_user_id = get_jwt_identity()
    deck = (
        Deck.query.join(Folder)
        .filter(Deck.id == deck_id, Folder.user_id == current_user_id)
        .first()
    )
    if not deck:
        return jsonify({"error": "Deck not found"}), 404

    data = request.get_json()
    question = data.get("question")
    answer = data.get("answer")
    difficulty_level = data.get("difficulty_level")

    # If the card is created for the first time,
    # next review should be in the next 24 hours
    # and the review_count is set as the default value of 0
    next_review_at = datetime.utcnow() + timedelta(days=1)
    review_count = data.get("review_count", 0)

    if not question or not answer or not difficulty_level:
        return jsonify({"error": "Missing required fields"}), 400

    question = question.strip()
    answer = answer.strip()

    if Card.query.filter_by(deck_id=deck_id, question=question).first():
        return jsonify({"error": "Question already exists"}), 409

    card = Card(
        question=question,
        answer=answer,
        difficulty_level=difficulty_level,
        next_review_at=next_review_at,
        review_count=review_count,
        is_fully_reviewed=False,
        deck_id=deck_id,
    )
    db.session.add(card)
    db.session.commit()

    return (
        jsonify(
            {
                "message": "Added a new card",
                "card": {
                    "card_id": card.id,
                    "question": card.question,
                    "answer": card.answer,
                    "difficulty_level": card.difficulty_level,
                    "next_review_at": card.next_review_at.isoformat(),
                    "review_count": card.review_count,
                    "is_fully_reviewed": card.is_fully_reviewed,
                },
            }
        ),
        201,
    )


@card_bp.route("/<int:card_id>", methods=["GET"])
@jwt_required()
def get_card(card_id):
    """Logic to get the information of a single card"""
    current_user_id = get_jwt_identity()

    # Join Card -> Deck -> Folder to verify ownership
    card = (
        Card.query.join(Deck)
        .join(Folder)
        .filter(Card.id == card_id, Folder.user_id == current_user_id)
        .first()
    )

    if not card:
        return jsonify({"error": "Card not found"}), 404

    card_data = {
        "id": card.id,
        "question": card.question,
        "answer": card.answer,
        "difficulty_level": card.difficulty_level,
        "next_review_at": card.next_review_at,
        "review_count": card.review_count,
        "is_fully_reviewed": card.is_fully_reviewed,
        "last_reviewed": card.last_reviewed,
    }

    return jsonify({"message": f"Card {card.id} is retrieved", "card": card_data}), 200


# Update a card's information partially
@card_bp.route("/<int:card_id>", methods=["PATCH"])
@jwt_required()
def update_card(card_id):
    current_user_id = get_jwt_identity()

    card = (
        Card.query.join(Deck)
        .join(Folder)
        .filter(Card.id == card_id, Folder.user_id == current_user_id)
        .first()
    )
    if not card:
        return jsonify({"error": "Card not found"}), 404

    data = request.get_json()
    question = data.get("question")
    answer = data.get("answer")
    difficulty_level = data.get("difficulty_level")

    if question:
        # Prevent duplicate question in same deck
        existing = Card.query.filter(
            Card.deck_id == card.deck_id, Card.question == question, Card.id != card.id
        ).first()
        if existing:
            return jsonify({"error": "Question already exists"}), 409
        card.question = question

    if answer:
        card.answer = answer
    if difficulty_level:
        card.difficulty_level = difficulty_level

    db.session.commit()

    return jsonify({"message": f"Updated card {card.id}"}), 200


# Delete a card
@card_bp.route("/<int:card_id>", methods=["DELETE"])
@jwt_required()
def delete_card(card_id):
    current_user_id = get_jwt_identity()

    card = (
        Card.query.join(Deck)
        .join(Folder)
        .filter(Card.id == card_id, Folder.user_id == current_user_id)
        .first()
    )
    if not card:
        return jsonify({"error": "Card not found"}), 404

    db.session.delete(card)
    db.session.commit()

    return jsonify({"message": f"Deleted card {card.id}"}), 200
