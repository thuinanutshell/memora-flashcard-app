from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models import db, User, Folder, Deck, Card
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func

folder_bp = Blueprint("folder", __name__)


@folder_bp.route("/", methods=["POST"])
@jwt_required()
def add_folder():
    """Logic to add a new folder to the database

    JSON Object data:
        - name (string)
        - description (string)
        - current_user_id (string): check the ID of the current user
    """
    data = request.get_json()
    name = data.get("name")
    description = data.get("description")
    current_user_id = get_jwt_identity()

    # Check to see if the folder's name already exists for the current user
    existing_folder = Folder.query.filter_by(user_id=current_user_id, name=name).first()
    if existing_folder:
        return (
            jsonify(
                {"error": "Folder name already exists. Please choose a different name"}
            ),
            409,
        )

    # Add the folder to the database for current user
    folder = Folder(name=name, description=description, user_id=current_user_id)
    db.session.add(folder)

    try:
        db.session.commit()

        # Return the created folder with consistent structure
        folder_data = {
            "_id": folder.id,  # Use _id for frontend consistency
            "id": folder.id,  # Keep id as backup
            "name": folder.name,
            "description": folder.description,
            "deckCount": 0,
            "cardCount": 0,
        }

        return (
            jsonify(
                {"message": f"New folder {folder.name} added", "folder": folder_data}
            ),
            201,
        )

    except IntegrityError:
        db.session.rollback()
        return (
            jsonify(
                {"error": "Folder name already exists. Please choose a different name"}
            ),
            409,
        )


@folder_bp.route("/", methods=["GET"])
@jwt_required()
def get_folders():
    """Logic to retrieve all folders for a user from the database"""
    current_user_id = get_jwt_identity()

    # Query all folders for the user with deck and card counts
    folders_query = (
        db.session.query(
            Folder,
            func.count(Deck.id).label("deck_count"),
            func.count(Card.id).label("card_count"),
        )
        .outerjoin(Deck, Folder.id == Deck.folder_id)
        .outerjoin(Card, Deck.id == Card.deck_id)
        .filter(Folder.user_id == current_user_id)
        .group_by(Folder.id)
        .all()
    )

    folder_list = []

    for folder, deck_count, card_count in folders_query:
        folder_info = {
            "_id": folder.id,  # Use _id for frontend consistency
            "id": folder.id,  # Keep id as backup
            "name": folder.name,
            "description": folder.description,
            "deckCount": deck_count or 0,
            "cardCount": card_count or 0,
        }
        folder_list.append(folder_info)

    return jsonify(folder_list), 200  # Return array directly


# Retrieve all decks from a specific folder
@folder_bp.route("/<int:folder_id>", methods=["GET"])
@jwt_required()
def get_one_folder(folder_id):
    current_user_id = get_jwt_identity()
    folder = Folder.query.filter_by(id=folder_id, user_id=current_user_id).first()

    if not folder:
        return jsonify({"error": "Folder not found"}), 404

    deck_list = [
        {
            "id": deck.id,
            "name": deck.name,
            "description": deck.description,
            "cardCount": len(deck.cards),
            "card_count": len(deck.cards),  # (alternative naming)
            "created_at": deck.created_at.isoformat() if deck.created_at else None,
            "updated_at": deck.updated_at.isoformat() if deck.updated_at else None,
        }
        for deck in folder.decks
    ]

    folder_info = {
        "_id": folder.id,
        "id": folder.id,
        "name": folder.name,
        "description": folder.description,
        "decks": deck_list,
        "deckCount": len(deck_list),
        "cardCount": sum(len(deck.cards) for deck in folder.decks),
    }
    return jsonify(folder_info), 200


# Update a folder partially: 1) change name, and 2) change description
@folder_bp.route("/<int:folder_id>", methods=["PATCH"])
@jwt_required()
def update_folder(folder_id):
    current_user_id = get_jwt_identity()
    folder = Folder.query.filter_by(id=folder_id, user_id=current_user_id).first()
    if not folder:
        return jsonify({"error": "Folder not found"}), 404

    data = request.get_json()
    name = data.get("name")
    description = data.get("description")

    if name:
        folder.name = name
    if description:
        folder.description = description

    try:
        db.session.commit()

        # Return updated folder data
        folder_data = {
            "_id": folder.id,
            "id": folder.id,
            "name": folder.name,
            "description": folder.description,
        }

        return (
            jsonify(
                {
                    "message": f"Updated folder {folder.id} with {folder.name} and {folder.description}",
                    "folder": folder_data,
                }
            ),
            200,
        )

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Folder name already exists"}), 409


# Delete a folder
@folder_bp.route("/<int:folder_id>", methods=["DELETE"])
@jwt_required()
def delete_folder(folder_id):
    current_user_id = get_jwt_identity()
    folder = Folder.query.filter_by(id=folder_id, user_id=current_user_id).first()

    if not folder:
        return jsonify({"error": "Folder not found"}), 404

    folder_name = folder.name
    db.session.delete(folder)
    db.session.commit()
    return jsonify({"message": f"Deleted folder '{folder_name}'"}), 200
