from functools import wraps
from flask import g, jsonify
import json
from scripts.credit_logic import get_total_credits


def checkSufficentCredits(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if get_total_credits(g.user.credits) < 1:
            print(get_total_credits(g.user.credits))
            return jsonify({'credit_error': "Insufficent credits to continue"}), 403
        return f(*args, **kwargs)
    return decorated
