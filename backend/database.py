import os
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey, DateTime, Text, Integer
import uuid
import hashlib
import datetime
from datetime import datetime, timezone
import os
import uuid
import hashlib
from datetime import datetime, timezone
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey, DateTime, Text
from sqlalchemy.sql import func
import json

from traitlets import default

load_dotenv()


def generate_session_id():
    random_data = os.urandom(32)
    session_id = hashlib.blake2b(random_data).hexdigest()
    return session_id[:20]  # Limit session ID to 20 characters


db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(36), primary_key=True,
                   default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    balance = db.Column(db.Text, nullable=False,
                        default=json.dumps(["0.0", "0.0", "0.0"]))
    credits = db.Column(db.Text, nullable=False,
                        default=json.dumps(["0.0", "0.0", "0.00", "0.00"]))


class Session(db.Model):
    __tablename__ = 'sessions'
    id = db.Column(db.String(20), primary_key=True,
                   default=generate_session_id)
    user_id = db.Column(db.String(36), db.ForeignKey(
        'users.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('sessions', lazy=True))
    created_at = db.Column(DateTime, default=lambda: datetime.now(
        timezone.utc), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    context = db.Column(Text, nullable=False, default="")
    role = db.Column(Text, nullable=False)
    messages = db.relationship('Message', backref='session', lazy=True)


class Message(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.String(36), primary_key=True,
                   default=lambda: str(uuid.uuid4()))
    content = db.Column(Text, nullable=False)
    type = db.Column(db.String(20), nullable=False)
    tokens = db.Column(db.Integer, nullable=False)
    cost = db.Column(db.Numeric(precision=38, scale=20), nullable=False)
    credit_cost = db.Column(db.Numeric(precision=38, scale=2), nullable=True)
    session_id = db.Column(db.String(20), db.ForeignKey(
        'sessions.id'), nullable=False)
    created_at = db.Column(DateTime, default=lambda: datetime.now(
        timezone.utc), nullable=False)


class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.String(36), primary_key=True,
                   default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Numeric(precision=38, scale=20), nullable=False)
    payment_date = db.Column(DateTime, default=lambda: datetime.now(
        timezone.utc), nullable=False)
    status = db.Column(db.String(20), nullable=False)

    user = db.relationship('User', backref=db.backref('payments', lazy=True))


class Preset(db.Model):
    __tablename__ = 'presets'
    id = db.Column(db.String(36), primary_key=True,
                   default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.Text, nullable=False)
    imagelink = db.Column(db.String(), nullable=False)
    user_id = db.Column(db.String(36), ForeignKey('users.id'), nullable=False)
    excerpt = db.Column(db.String(), nullable=False)
    isNsfw = db.Column(db.Boolean(), nullable=False)
    theme = db.Column(db.String(30), nullable=False)
    count = db.Column(db.Integer(), nullable=False, server_default='0')
    namereq = db.Column(db.Boolean(), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True),
                           server_default=func.now())
    user = db.relationship('User', backref=db.backref('presets', lazy=True))


def init_db(app):
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)

    with app.app_context():
        db.create_all()
