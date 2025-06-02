from flask import Blueprint

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=['POST'])
@auth_bp.route('/login', methods=['POST'])
@auth_bp.route('/logout', methods=['POST'])