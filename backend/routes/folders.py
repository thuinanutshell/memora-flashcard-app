from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.crud_service import CRUDService

bp_folder = Blueprint("folder", __name__)


@bp_folder.route("/", methods=["POST"])
@jwt_required()
def add_folder():
    folder_data = request.get_json()
    current_user_id = get_jwt_identity()

    result = CRUDService.add_new_folder(folder_data, current_user_id)
    return (
        jsonify({"message": "Folder created successfully!", "data": result["data"]}),
        201,
    )


@bp_folder.route("/", methods=["GET"])
@jwt_required()
def get_all_folders():
    current_user_id = get_jwt_identity()
    result = CRUDService.get_all_folders(current_user_id)
    return (
        jsonify(
            {"message": "All folders retrieved successfully", "data": result["data"]}
        ),
        200,
    )


@bp_folder.route("/<int:folder_id>", methods=["GET"])
@jwt_required()
def get_one_folder(folder_id):
    current_user_id = get_jwt_identity()
    result = CRUDService.get_one_folder(folder_id, current_user_id)
    return (
        jsonify({"message": "Retrieve all decks successfully", "data": result["data"]}),
        200,
    )


@bp_folder.route("/<int:folder_id>", methods=["PATCH"])
@jwt_required()
def update_folder(folder_id):
    current_user_id = get_jwt_identity()
    update_data = request.get_json()
    result = CRUDService.update_one_folder(folder_id, current_user_id, update_data)
    return (
        jsonify({"message": "Updated folder successfully", "data": result["data"]}),
        200,
    )


@bp_folder.route("/<int:folder_id>", methods=["DELETE"])
@jwt_required()
def delete_folder(folder_id):
    current_user_id = get_jwt_identity()
    CRUDService.delete_one_folder(folder_id, current_user_id)
    return (
        jsonify(
            {
                "message": "Deleted folder successfully",
            }
        ),
        200,
    )
