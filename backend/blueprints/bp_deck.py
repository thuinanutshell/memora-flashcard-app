from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models import db, Folder, Deck, Card
from sqlalchemy.exc import IntegrityError
from datetime import datetime

deck_bp = Blueprint("deck", __name__)


@deck_bp.route("/<int:folder_id>", methods=["POST"])
@jwt_required()
def add_deck(folder_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()

    # Validate input
    if not data:
        return jsonify({"error": "No data provided"}), 400

    name = data.get("name")
    description = data.get("description", "")

    if not name:
        return jsonify({"error": "Deck name is required"}), 400

    # Verify folder exists and belongs to user
    folder = Folder.query.filter_by(id=folder_id, user_id=current_user_id).first()
    if not folder:
        return jsonify({"error": "Folder not found"}), 404

    # Check for existing deck name (case-insensitive)
    existing_deck = Deck.query.filter(
        db.func.lower(Deck.name) == db.func.lower(name), Deck.folder_id == folder_id
    ).first()

    if existing_deck:
        return jsonify({"error": "Deck name already exists"}), 409

    try:
        deck = Deck(
            name=name,
            description=description,
            folder_id=folder_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.session.add(deck)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Deck created successfully",
                    "deck": {
                        "id": deck.id,
                        "name": deck.name,
                        "description": deck.description,
                        "folder_id": deck.folder_id,
                    },
                }
            ),
            201,
        )

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Database error occurred"}), 500


@deck_bp.route("/folder/<int:folder_id>", methods=["GET"])
@jwt_required()
def get_all_decks(folder_id):
    current_user_id = get_jwt_identity()

    # Verify folder belongs to user
    folder = Folder.query.filter_by(id=folder_id, user_id=current_user_id).first()
    if not folder:
        return jsonify({"error": "Folder not found"}), 404

    decks = Deck.query.filter_by(folder_id=folder_id).all()

    return (
        jsonify(
            {
                "decks": [
                    {
                        "id": deck.id,
                        "name": deck.name,
                        "description": deck.description,
                        "card_count": len(deck.cards),
                        "created_at": deck.created_at.isoformat(),
                        "updated_at": deck.updated_at.isoformat(),
                    }
                    for deck in decks
                ]
            }
        ),
        200,
    )


@deck_bp.route("/<int:deck_id>", methods=["GET"])
@jwt_required()
def get_one_deck(deck_id):
    current_user_id = get_jwt_identity()

    deck = (
        Deck.query.join(Folder)
        .filter(Deck.id == deck_id, Folder.user_id == current_user_id)
        .first()
    )

    if not deck:
        return jsonify({"error": "Deck not found"}), 404

    return (
        jsonify(
            {
                "deck": {
                    "id": deck.id,
                    "name": deck.name,
                    "description": deck.description,
                    "folder_id": deck.folder_id,
                    "cards": [
                        {
                            "id": card.id,
                            "question": card.question,
                            "answer": card.answer,
                            "difficulty_level": card.difficulty_level,
                            "next_review_at": (
                                card.next_review_at.isoformat()
                                if card.next_review_at
                                else None
                            ),
                            "review_count": card.review_count,
                            "is_fully_reviewed": card.is_fully_reviewed,
                            "last_reviewed": (
                                card.last_reviewed.isoformat()
                                if card.last_reviewed
                                else None
                            ),
                        }
                        for card in deck.cards
                    ],
                    "created_at": deck.created_at.isoformat(),
                    "updated_at": deck.updated_at.isoformat(),
                }
            }
        ),
        200,
    )


@deck_bp.route("/<int:deck_id>", methods=["PATCH"])
@jwt_required()
def update_deck(deck_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()

    deck = (
        Deck.query.join(Folder)
        .filter(Deck.id == deck_id, Folder.user_id == current_user_id)
        .first()
    )

    if not deck:
        return jsonify({"error": "Deck not found"}), 404

    name = data.get("name")
    description = data.get("description")

    if name:
        # Check if new name conflicts with existing deck
        existing_deck = Deck.query.filter(
            db.func.lower(Deck.name) == db.func.lower(name),
            Deck.folder_id == deck.folder_id,
            Deck.id != deck_id,
        ).first()

        if existing_deck:
            return jsonify({"error": "Deck name already exists in this folder"}), 409

        deck.name = name

    if description is not None:
        deck.description = description

    deck.updated_at = datetime.utcnow()

    try:
        db.session.commit()
        return (
            jsonify(
                {
                    "message": "Deck updated successfully",
                    "deck": {
                        "id": deck.id,
                        "name": deck.name,
                        "description": deck.description,
                    },
                }
            ),
            200,
        )
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Database error occurred"}), 500


@deck_bp.route("/<int:deck_id>", methods=["DELETE"])
@jwt_required()
def delete_deck(deck_id):
    current_user_id = get_jwt_identity()

    deck = (
        Deck.query.join(Folder)
        .filter(Deck.id == deck_id, Folder.user_id == current_user_id)
        .first()
    )

    if not deck:
        return jsonify({"error": "Deck not found"}), 404

    try:
        db.session.delete(deck)
        db.session.commit()
        return jsonify({"message": "Deck deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete deck", "details": str(e)}), 500
