from flask import Flask, jsonify, Blueprint
from flask_cors import CORS
from routes import register_blueprints
from database import init_db, db
from flask_migrate import Migrate
import os

app = Flask(__name__)
CORS(app, origins=['https://brokengpt.com',
                   ], supports_credentials=True)
app.secret_key = os.getenv('SECRET_KEY', os.urandom(24))


register_blueprints(app)
init_db(app)

migrate = Migrate(app, db)


@app.route('/')
def home():
    return jsonify({'message': 'Working update'})


if __name__ == '__main__':
    # Fixed the issue by closing the parentheses
    app.run(port=5000, host='0.0.0.0')
