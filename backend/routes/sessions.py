from crypt import methods
from flask import Blueprint, request, jsonify, make_response
from database import db, User, Session, Message, Preset
import os
from dotenv import load_dotenv
from middleware.userMiddleware import token_required
import jwt

load_dotenv()

session_bp = Blueprint('session', __name__)


@session_bp.route('/create', methods=['POST'])
@token_required
def create_session():
    data = request.get_json()
    cookie = request.cookies.get('access_token')
    role = data.get('role')
    name = data.get('name')
    bot = data.get('bot')
    user_id = jwt.decode(cookie, os.getenv('JWT_SECRET'),
                         algorithms=['HS256'])['user_id']

    if bot:
        try:
            preset = Preset.query.filter_by(id=bot).first()
            preset.count += 1
            db.session.commit()
            role = preset.role

            new_session = Session(user_id=user_id, role=preset.role,
                                  name=name, context="")

            db.session.add(new_session)
            db.session.commit()
            return make_response(jsonify({"name": new_session.name, "id": new_session.id, "created_at": new_session.created_at}), 201)
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Error creating the session", "details": str(e)}), 500

    try:

        new_session = Session(user_id=user_id, role=role,
                              name=name, context="")
        db.session.add(new_session)
        db.session.commit()

        return make_response(jsonify({"name": new_session.name, "id": new_session.id, "created_at": new_session.created_at}), 201)
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error creating the session", "details": str(e)}), 500


@ session_bp.route('/delete/<string:session_id>', methods=['DELETE'])
@ token_required
def delete_session(session_id):
    cookie = request.cookies.get('access_token')
    user_id = jwt.decode(cookie, os.getenv('JWT_SECRET'),
                         algorithms=['HS256'])['user_id']
    try:
        session = Session.query.get(session_id)
        if not session:
            return jsonify({'error': 'Session not found'}, 404), 404
        if str(session.user_id) != str(user_id):  # Convert both IDs to strings for comparison
            return jsonify({'error': 'You are not the owner of this session'}, 403), 403

        # Delete all messages associated with the session
        Message.query.filter_by(session_id=session_id).delete()

        db.session.delete(session)
        db.session.commit()
        return jsonify({'message': 'Session deleted successfully'}, 200)

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error deleting session", "details": str(e)}), 500


@ session_bp.route('/get', methods=['POST'])
@ token_required
def get_sessions():
    user_id = request.cookies.get('access_token')
    decoded_token = jwt.decode(user_id, os.getenv(
        'JWT_SECRET'), algorithms=['HS256'])

    sessions = Session.query.filter_by(user_id=decoded_token['user_id']).all()
    session_list = []
    for session in sessions:
        session_list.append({
            'id': session.id,
            'name': session.name,
            'created_at': session.created_at
        })

    return jsonify({"sessions": session_list}), 200


@ session_bp.route('/update', methods=['POST'])
@ token_required
def update_session(session_id):
    token = request.cookies.get('access_token')
    user_id = jwt.decode(token, os.getenv('JWT_SECRET'),
                         algorithms=['HS256'])['user_id']
    session = Session.query.filter_by(id=session_id).first()

    if session.user_id != user_id:
        return jsonify({'error': 'You are not the owner of this session'}), 403

    data = request.get_json()

    name = data['name']
    role = data['role']

    update = Session.query.update(name=name, role=role)

    return jsonify({'message': "Session updated successfully"})


@session_bp.route('/recent', methods=['GET'])
@token_required
def get_recent_sessions():

    token = request.cookies.get('access_token')
    user_id = jwt.decode(token, os.getenv('JWT_SECRET'),
                         algorithms=['HS256'])['user_id']

    sessions = Session.query.filter_by(user_id=user_id).order_by(
        Session.created_at.desc()).limit(5).all()

    session_list = []
    for session in sessions:
        session_list.append({
            'id': session.id,
            'name': session.name,
            'created_at': session.created_at
        })

    return jsonify({"sessions": session_list}), 200


@session_bp.route('/session/<string:id>', methods=['GET'])
@token_required
def getName(id):
    session = Session.query.filter_by(id=id).first()
    return jsonify({"name": session.name}), 200
