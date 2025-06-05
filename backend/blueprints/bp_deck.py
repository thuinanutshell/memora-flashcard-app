from flask import Flask, jsonify, request, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Folder, Deck

deck_bp = Blueprint("deck", __name__)


@deck_bp.route("/<int:folder_id>", methods=["POST"])
@jwt_required()
def add_deck(folder_id):
    current_user_id = get_jwt_identity()
    folder = Folder.query.filter_by(id=folder_id, user_id=current_user_id).first()
    if not folder:
        return jsonify({"error": "Folder not found"}), 404

    data = request.get_json()
    name = data.get("name")
    description = data.get("description")

    if not name:
        return jsonify({"error": "Deck name is required"}), 400

    existing_deck = Deck.query.filter_by(folder_id=folder_id, name=name).first()
    if existing_deck:
        return (
            jsonify(
                {"error": "Deck name already exists. Please choose a different name"}
            ),
            409,
        )

    deck = Deck(name=name, description=description, folder_id=folder_id)
    db.session.add(deck)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Deck name already exists"}), 409

    return jsonify({"message": "A new deck is added", "deck_id": deck.id}), 201


# Retrieve all cards from a single deck
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

    card_list = [
        {
            "id": card.id,
            "question": card.question,
            "answer": card.answer,
            "difficulty_level": card.difficulty_level,
        }
        for card in deck.cards
    ]

    return jsonify({"cards": card_list}), 200


# Update a single deck
@deck_bp.route("/<int:deck_id>", methods=["PATCH"])
@jwt_required()
def update_deck(deck_id):
    current_user_id = get_jwt_identity()
    deck = (
        Deck.query.join(Folder)
        .filter(Deck.id == deck_id, Folder.user_id == current_user_id)
        .first()
    )
    if not deck:
        return jsonify({"error": "Deck not found"}), 404

    data = request.get_json()
    name = data.get("name")
    description = data.get("description")

    if name:
        deck.name = name
    if description:
        deck.description = description

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Deck name already exists"}), 409

    return jsonify({"message": f"Updated deck {deck.id}"}), 200


# Delete a single deck
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

    db.session.delete(deck)
    db.session.commit()
    return jsonify({"message": f"Deleted deck {deck.id}"}), 200
