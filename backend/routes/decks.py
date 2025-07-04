from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.crud_service import CRUDService

bp_deck = Blueprint("deck", __name__)


@bp_deck.route("/<int:folder_id>", methods=["POST"])
@jwt_required()
def add_deck(folder_id):
    """Create a new deck for a specific folder"""
    current_user_id = get_jwt_identity()
    deck_data = request.get_json()
    result = CRUDService.add_new_deck(deck_data, folder_id, current_user_id)
    return (
        jsonify({"message": "Deck created successfully", "data": result["data"]}),
        201,
    )


@bp_deck.route("/<int:deck_id>", methods=["GET"])
@jwt_required()
def get_one_deck(deck_id):
    """Retrieve all cards for a specific deck"""
    current_user_id = get_jwt_identity()
    result = CRUDService.get_one_deck(deck_id, current_user_id)
    return (
        jsonify({"message": "Retrieved deck successfully", "data": result["data"]}),
        200,
    )


@bp_deck.route("/<int:deck_id>", methods=["PATCH"])
@jwt_required()
def update_deck(deck_id):
    current_user_id = get_jwt_identity()
    update_data = request.get_json()
    result = CRUDService.update_one_deck(deck_id, update_data, current_user_id)
    return (
        jsonify({"message": "Updated deck successfully", "data": result["data"]})
    ), 200


@bp_deck.route("/<int:deck_id>", methods=["DELETE"])
@jwt_required()
def delete_deck(deck_id):
    current_user_id = get_jwt_identity()
    result = CRUDService.delete_one_deck(deck_id, current_user_id)
    return (jsonify({"message": "Deleted deck successfully"})), 200
