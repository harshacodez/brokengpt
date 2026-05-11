import jwt
from functools import wraps
from flask import request, jsonify, g
from database import User
import os


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'access_token' in request.cookies:
            token = request.cookies.get('access_token')

        if not token:
            return jsonify({'error': 'Login to continue'}), 401

        try:

            data = jwt.decode(token, os.getenv(
                'JWT_SECRET'), algorithms=['HS256'])
            user_id = data['user_id']

            current_user = User.query.get(user_id)

            if not current_user:
                return jsonify({'error': 'Invalid token'}), 401

            g.user = current_user

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Login again'})

        return f(*args, **kwargs)
    return decorated
