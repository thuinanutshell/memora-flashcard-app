from flask import Blueprint

card_bp = Blueprint('card', __name__, url_prefix='/card')

@card_bp.route('/create_card', methods=['POST'])
@card_bp.route('/read_card/<int:card_id>', methods=['GET'])
@card_bp.route('/update_card/<int:card_id>', methods=['PUT'])
@card_bp.route('/delete_card/<int:card_id>', methods=['DELETE'])