from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.crud_service import CRUDService

bp_card = Blueprint("card", __name__)


@bp_card.route("/<int:deck_id>", methods=["POST"])
@jwt_required()
def add_card(deck_id):
    # Verify ownership of the deck
    current_user_id = get_jwt_identity()
    card_data = request.get_json()
    result = CRUDService.add_new_card(card_data, deck_id, current_user_id)
    return (
        jsonify({"message": "Created card successfully", "data": result["data"]}),
        201,
    )


@bp_card.route("/<int:card_id>", methods=["GET"])
@jwt_required()
def get_card(card_id):
    """Logic to get the information of a single card"""
    current_user_id = get_jwt_identity()
    result = CRUDService.get_one_card(card_id, current_user_id)
    return (
        jsonify({"message": "Retrieved card successfully", "data": result["data"]}),
        200,
    )


@bp_card.route("/<int:card_id>", methods=["PATCH"])
@jwt_required()
def update_card(card_id):
    current_user_id = get_jwt_identity()
    update_data = request.get_json()
    result = CRUDService.update_one_card(card_id, current_user_id, update_data)
    return (
        jsonify({"message": "Updated card successfully", "data": result["data"]}),
        200,
    )


@bp_card.route("/<int:card_id>", methods=["DELETE"])
@jwt_required()
def delete_card(card_id):
    current_user_id = get_jwt_identity()
    result = CRUDService.delete_one_card(card_id, current_user_id)
    return jsonify({"message": "Deleted card successfully"}), 200
