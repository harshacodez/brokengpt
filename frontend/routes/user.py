from flask import Blueprint, jsonify, request, make_response
from flask_dance.contrib.google import make_google_blueprint
from database import db, User
import os
from dotenv import load_dotenv
import jwt
import datetime
import json
from middleware.userMiddleware import token_required
from scripts.credit_logic import get_total_credits
import math

load_dotenv()

user_bp = Blueprint('user', __name__)
google_bp = make_google_blueprint(
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    scope=["profile", "email"],
    redirect_to='google.callback'
)


@user_bp.route('/login', methods=['POST'])
def create_user():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        payload = {
            'user_id': str(existing_user.id),
            'name': existing_user.name,
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=30)
        }
        token = jwt.encode(payload, os.getenv('JWT_SECRET'), algorithm='HS256')
        total = get_total_credits(existing_user.credits)
        response = make_response(jsonify({'user': {'name': existing_user.name,
                                                   'email': existing_user.email, 'credits': total}}))
        response.set_cookie('access_token', token,
                            httponly=True, secure=True, samesite='None')
        return response

    try:
        new_user = User(name=name, email=email, balance=json.dumps(
            [0.00, 0.00, 0.00]), credits=json.dumps([0.00, 0.00, 0.00, 100.00]))
        db.session.add(new_user)
        db.session.commit()

        payload = {
            'user_id': str(new_user.id),
            'name': new_user.name,
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=30)
        }
        token = jwt.encode(payload, os.getenv('JWT_SECRET'), algorithm='HS256')
        total = get_total_credits(new_user.credits)
        response = make_response(jsonify(
            {'message': 'Logged in successfully', "joining_message": "You are rewarded with 100 credits to try the product", 'user': {'name': new_user.name, 'email': new_user.email, 'credits': total}}))
        response.set_cookie('access_token', token,
                            httponly=True, secure=True, samesite='None')
        return response

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f"Error creating user: {str(e)}"}), 500


@user_bp.route('/check', methods=['GET'])
@token_required
def check_user():
    user_id = request.cookies.get('access_token')
    if not user_id:
        return jsonify({'error': 'User not found'}), 404
    decoded_token = jwt.decode(user_id, os.getenv(
        'JWT_SECRET'), algorithms=['HS256'])
    user = User.query.get(decoded_token['user_id'])
    return jsonify({'user': {'name': user.name, 'email': user.email, 'credits': get_total_credits(user.credits)}})


@user_bp.route("/credits", methods=["GET"])
@token_required
def get_credits():
    user_id = request.cookies.get('access_token')
    if not user_id:
        return jsonify({'error': 'User not found'}), 404
    decoded_token = jwt.decode(user_id, os.getenv(
        'JWT_SECRET'), algorithms=['HS256'])
    user = User.query.get(decoded_token['user_id'])
    total_credits = get_total_credits(user.credits)
    return jsonify({'credits': math.floor(total_credits)})


@user_bp.route('/logout', methods=['POST'])
@token_required
def logout():
    response = make_response(jsonify({'message': 'Logged out successfully'}))
    response.set_cookie('access_token', '', expires=0)
    return response
