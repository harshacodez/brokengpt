import os
import random
from flask import Blueprint, request, jsonify
# Assuming Preset is your SQLAlchemy model
from database import Preset, Session, db
from sqlalchemy import desc
import boto3
import jwt
import hashlib
import time

from middleware.userMiddleware import token_required

presets_bp = Blueprint('presets', __name__)

# Function to generate a unique key for S3 uploads


def generate_key(user_id):
    seed = f"{time.time()}{user_id}"

    # Create a hash of the combined string
    hash_object = hashlib.sha256(seed.encode())
    hash_string = hash_object.hexdigest()

    # Return a substring of the hash to match the desired length (20 characters)
    return hash_string[:20]


# Function to upload file to AWS S3
def upload_file_to_s3(file, user_id):
    try:
        s3 = boto3.client('s3', aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                          aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'))

        key = generate_key(user_id)
        s3.upload_fileobj(file, os.getenv('AWS_BUCKET'), key)

        return key
    except Exception as e:
        # Log the exception or handle it as needed
        raise Exception(f"Error uploading the file: {str(e)}")


@presets_bp.route('/<string:theme>', methods=['GET'])
def get_presets(theme):
    page = request.args.get('page', 1, type=int)
    per_page = 9  # Number of presets per page

    if theme == "latest":
        presets = Preset.query.order_by(desc(Preset.created_at)).paginate(
            page=page, per_page=per_page, error_out=False)
    elif theme == "all":
        presets = Preset.query.order_by(desc(Preset.count)).paginate(
            page=page, per_page=per_page, error_out=False)
    else:
        presets = Preset.query.filter_by(theme=theme).order_by(desc(Preset.count)).paginate(
            page=page, per_page=per_page, error_out=False)

    preset_list = [{
        'name': preset.name,
        'imagelink': preset.imagelink,
        'isNsfw': preset.isNsfw,
        'count': preset.count,
        'excerpt': preset.excerpt,
        'id': preset.id,
        'namereq': preset.namereq,
    } for preset in presets.items]

    return jsonify({
        'presets': preset_list,
        'current_page': presets.page,
        'total_pages': presets.pages
    })


@presets_bp.route('/create/private', methods=['POST'])
@token_required
def create_preset():
    token = request.cookies.get('access_token')
    user_id = jwt.decode(token, os.getenv('JWT_SECRET'),
                         algorithms=['HS256'])['user_id']

    data = request.get_json()
    name = data.get('name')
    description = data.get('description')

    session = Session(name=name, role=description, user_id=user_id, context="")

    db.session.add(session)
    db.session.commit()

    return jsonify({'id': session.id, 'name': session.name}), 201


@presets_bp.route('/create/public', methods=['POST'])
@token_required
def create_public_preset():
    token = request.cookies.get('access_token')
    user_id = jwt.decode(token, os.getenv('JWT_SECRET'),
                         algorithms=['HS256'])['user_id']

    data = request.form
    name = data.get('name')
    role = data.get('role')
    excerpt = data.get('excerpt')
    isNsfw = data.get('isNsfw') == 'true'  # Convert string to boolean
    theme = data.get('theme')
    namereq = data.get('namereq') == 'true'  # Convert string to boolean
    file = request.files['image']

    try:
        # Attempt to upload the file and generate the link
        key = upload_file_to_s3(file, user_id)
        link = 'https://d1kwazwznox8op.cloudfront.net/' + key
    except Exception as e:
        # Return an error message if the upload fails
        return jsonify({"error": "Error uploading the image", "details": str(e)}), 500

    try:
        # Create a new Preset entry in the database
        preset = Preset(name=name, role=role, imagelink=link, user_id=user_id,
                        excerpt=excerpt, isNsfw=isNsfw, theme=theme, namereq=namereq)
        db.session.add(preset)
        db.session.commit()

        return jsonify({'id': preset.id, 'name': preset.name}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error creating the preset", "details": str(e)}), 500
