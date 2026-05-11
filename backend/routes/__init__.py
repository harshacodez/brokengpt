from .user import user_bp
from .sessions import session_bp
from .messages import message_bp
from .payments import payments_bp
from .presets import presets_bp


def register_blueprints(app):
    app.register_blueprint(user_bp, url_prefix='/users')
    app.register_blueprint(session_bp, url_prefix='/sessions')
    app.register_blueprint(message_bp, url_prefix='/messages')
    app.register_blueprint(payments_bp, url_prefix='/payments')
    app.register_blueprint(presets_bp, url_prefix='/bots')
