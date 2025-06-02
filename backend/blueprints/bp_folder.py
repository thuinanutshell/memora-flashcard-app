from flask import Blueprint

folder_bp = Blueprint('folder', __name__, url_prefix='/folder')

@folder_bp.route('/create_folder', methods=['POST'])
@folder_bp.route('/read_folder/<int:folder_id>', methods=['GET'])
@folder_bp.route('/update_folder/<int:folder_id>', methods=['PUT'])
@folder_bp.route('/delete_folder/<int:folder_id>', methods=['DELETE'])