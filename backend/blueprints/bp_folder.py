from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Folder, Deck

folder_bp = Blueprint("folder", __name__)


@folder_bp.route("/", methods=["POST"])
@jwt_required()
def add_folder():
    """Logic to add a new folder to the database"""
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
    except IntegrityError:
        db.session.rollback()
        return (
            jsonify(
                {"error": "Folder name already exists. Please choose a different name"}
            ),
            409,
        )
    return jsonify({"message": f"New folder {folder.name} added"}), 201


@folder_bp.route("/", methods=["GET"])
@jwt_required()
def get_folders():
    """Logic to retrieve all folders for a user from the database"""
    current_user_id = get_jwt_identity()

    # Query all folders for the user
    folders = Folder.query.filter_by(user_id=current_user_id).all()

    folder_list = []

    for folder in folders:
        folder_info = {
            "id": folder.id,
            "name": folder.name,
            "description": folder.description,
        }
        folder_list.append(folder_info)

    return jsonify({"folders": folder_list}), 200


# Retrieve all decks from a specific folder
@folder_bp.route("/<int:folder_id>", methods=["GET"])
@jwt_required()
def get_one_folder(folder_id):
    current_user_id = get_jwt_identity()
    folder = Folder.query.filter_by(id=folder_id, user_id=current_user_id).first()

    if not folder:
        return jsonify({"error": "Folder not found"}), 404

    deck_list = [
        {"id": deck.id, "name": deck.name, "description": deck.description}
        for deck in folder.decks
    ]

    folder_info = {
        "id": folder.id,
        "name": folder.name,
        "description": folder.description,
        "decks": deck_list,
    }
    return jsonify(folder_info), 200


# Update a folder partiall: 1) change name, and 2) change description
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
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Folder name already exists"}), 409

    return jsonify({"message": f"Updated folder {folder.id}"}), 200


# Delete a folder
@folder_bp.route("/<int:folder_id>", methods=["DELETE"])
@jwt_required()
def delete_folder(folder_id):
    current_user_id = get_jwt_identity()
    folder = Folder.query.filter_by(id=folder_id, user_id=current_user_id).first()

    if not folder:
        return jsonify({"error": "Folder not found"}), 404

    db.session.delete(folder)
    db.session.commit()
    return jsonify({"message": f"Deleted folder '{folder.name}'"}), 200
