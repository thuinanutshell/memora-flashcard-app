from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models import db, Deck, Card, Review, Folder
from datetime import datetime, timedelta
from backend.services.review_service import ReviewService
from backend.utils import (
    success_response,
    error_response,
    data_response,
    validation_error,
    not_found_error,
    duplicate_error,
)

card_bp = Blueprint("card", __name__)


@card_bp.route("/<int:deck_id>", methods=["POST"])
@jwt_required()
def add_card(deck_id):
    """Logic to create a new card"""
    # Verify ownership of the deck
    current_user_id = get_jwt_identity()
    deck = (
        Deck.query.join(Folder)
        .filter(Deck.id == deck_id, Folder.user_id == current_user_id)
        .first()
    )
    if not deck:
        return not_found_error("Deck", deck_id)

    data = request.get_json()

    # Validate required fields
    required_fields = ["question", "answer", "difficulty_level"]
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        return validation_error(missing_fields)

    question = data.get("question").strip()
    answer = data.get("answer").strip()
    difficulty_level = data.get("difficulty_level")

    # Check for duplicate question in the same deck
    if Card.query.filter_by(deck_id=deck_id, question=question).first():
        return duplicate_error("Card", "question")

    # If the card is created for the first time,
    # next review should be in the next 24 hours
    next_review_at = datetime.utcnow() + timedelta(days=1)
    review_count = data.get("review_count", 0)

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

    return success_response(
        message="Card created successfully",
        data={
            "card": {
                "id": card.id,
                "question": card.question,
                "answer": card.answer,
                "difficulty_level": card.difficulty_level,
                "next_review_at": card.next_review_at.isoformat(),
                "review_count": card.review_count,
                "is_fully_reviewed": card.is_fully_reviewed,
                "last_reviewed": None,
            }
        },
        status_code=201,
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
        return not_found_error("Card", card_id)

    card_data = {
        "id": card.id,
        "question": card.question,
        "answer": card.answer,
        "difficulty_level": card.difficulty_level,
        "next_review_at": (
            card.next_review_at.isoformat() if card.next_review_at else None
        ),
        "review_count": card.review_count,
        "is_fully_reviewed": card.is_fully_reviewed,
        "last_reviewed": card.last_reviewed.isoformat() if card.last_reviewed else None,
    }

    return success_response(data={"card": card_data})


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
        return not_found_error("Card", card_id)

    data = request.get_json()
    question = data.get("question")
    answer = data.get("answer")
    difficulty_level = data.get("difficulty_level")

    if question:
        question = question.strip()
        # Prevent duplicate question in same deck
        existing = Card.query.filter(
            Card.deck_id == card.deck_id, Card.question == question, Card.id != card.id
        ).first()
        if existing:
            return duplicate_error("Card", "question")
        card.question = question

    if answer:
        card.answer = answer.strip()
    if difficulty_level:
        card.difficulty_level = difficulty_level

    db.session.commit()

    # Return the updated card data
    return success_response(
        message="Card updated successfully",
        data={
            "card": {
                "id": card.id,
                "question": card.question,
                "answer": card.answer,
                "difficulty_level": card.difficulty_level,
                "next_review_at": (
                    card.next_review_at.isoformat() if card.next_review_at else None
                ),
                "review_count": card.review_count,
                "is_fully_reviewed": card.is_fully_reviewed,
                "last_reviewed": (
                    card.last_reviewed.isoformat() if card.last_reviewed else None
                ),
            }
        },
    )


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
        return not_found_error("Card", card_id)

    db.session.delete(card)
    db.session.commit()

    return success_response(message="Card deleted successfully")
