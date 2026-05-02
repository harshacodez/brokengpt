import os
from flask import jsonify, request, Blueprint
import requests
from dotenv import load_dotenv
import json
import base64
import jwt
from database import Payment, db, User

load_dotenv()

client_id = os.getenv('PAYPAL_CLIENT_ID')
secret = os.getenv('PAYPAL_SECRET')
base_url = "https://api-m.paypal.com"
token_url = f"{base_url}/v1/oauth2/token"

payments_bp = Blueprint('payments', __name__)


@payments_bp.route("/get-access-token", methods=["POST"])
def get_access_token():
    headers = {
        "Authorization": f"Basic {base64.b64encode((client_id + ':' + secret).encode()).decode()}",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    response = requests.post(token_url, headers=headers, data={
        "grant_type": "client_credentials",
    })

    return jsonify({"access_token": response.json().get("access_token")})


@payments_bp.route("/create-order", methods=["POST"])
def create_order():
    access_token = get_access_token().json.get("access_token")
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    data = request.get_json()
    item_name = data.get("itemName")
    amount_str = data.get("amount")

    try:
        amount = float(amount_str)
        if amount <= 0:
            return jsonify({"error": "Invalid amount"}), 400
    except ValueError:
        return jsonify({"error": "Invalid amount format"}), 400

    order_data = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "amount": {
                    "currency_code": "USD",
                    "value": f"{amount:.2f}"
                },
            }],
        "application_context": {
            "shipping_preference": "NO_SHIPPING",
        }
    }

    response = requests.post(f"{base_url}/v2/checkout/orders",
                             headers=headers,
                             data=json.dumps(order_data))

    if response.status_code == 201:
        order_json = response.json()
        order_id = order_json["id"]
        approval_url = next(
            (link['href'] for link in order_json['links'] if link['rel'] == 'approve'), None)
        return jsonify({'id': order_id, 'approval_url': approval_url}), 200
    else:
        return jsonify({"error": "Failed to create order"}), 500


@payments_bp.route("/capture-order/<orderId>", methods=["POST"])
def capture_order(orderId):
    jwtToken = request.cookies.get("access_token").encode("utf-8")
    decoded_token = jwt.decode(jwtToken, os.getenv(
        'JWT_SECRET'), algorithms=['HS256'])
    access_token = get_access_token().json.get("access_token")
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        f"{base_url}/v2/checkout/orders/{orderId}/capture", headers=headers)

    if response.status_code == 201:
        try:
            order_json = response.json()

            rechargetypes = {
                "1.59": {
                    "plan": "basic",
                    "credits": 1500
                },
                "4.99": {
                    "plan": "pro",
                    "credits": 7000
                },
                "16.99": {
                    "plan": "premium",
                    "credits": 50000
                }
            }

            amount = order_json['purchase_units'][0]['payments']['captures'][0]['amount']['value']

            amountPlan = rechargetypes.get(amount, {}).get('plan')

            net_amount = order_json['purchase_units'][0]['payments']['captures'][
                0]['seller_receivable_breakdown']['net_amount']['value']

            user_id = decoded_token['user_id']

            payment = Payment(user_id=user_id, amount=float(net_amount),
                              status=order_json['status'])

            update_credits(net_amount, user_id, amountPlan)

            db.session.add(payment)
            db.session.commit()

            return jsonify({"status": order_json['status'], "plan": amountPlan}), 200
        except KeyError as e:
            return jsonify({"error": f"KeyError: {str(e)}"}), 500
        except json.JSONDecodeError as e:
            return jsonify({"error": f"JSONDecodeError: {str(e)}"}), 500
    else:
        return jsonify({"error": "Failed to capture order", "response": response.text}), 500


@payments_bp.route("/cancel-order", methods=["GET"])
def cancel_order():
    return jsonify({"status": "cancelled"})

# Scripts


rechargetypes = {
    "basic": {
        "credits": 1500
    },
    "pro": {
        "credits": 7000
    },
    "premium": {
        "credits": 50000
    }
}


def update_credits(net_amount, user_id, plan):
    try:
        # Get the user
        user = User.query.filter_by(id=user_id).first()

        # Assuming `user.balance` and `user.credits` are JSON strings and you want to parse them as lists
        amount_list = json.loads(user.balance)
        credit_list = json.loads(user.credits)

        planIndex = 0
        for index, key in enumerate(rechargetypes):
            if key == plan:
                planIndex = index

        # Convert the values to floats before performing arithmetic operations
        amount_list[planIndex] = float(amount_list[planIndex])
        credit_list[planIndex] = int(credit_list[planIndex])

        # Updating the balance and credits based on the plan
        amount_list[planIndex] += float(net_amount)
        credit_list[planIndex] += rechargetypes[plan]["credits"]

        # Convert the lists back to JSON strings to store in the database
        updated_amount = json.dumps(amount_list)
        updated_credits = json.dumps(credit_list)

        user.balance = updated_amount
        user.credits = updated_credits

        db.session.commit()

    except json.JSONDecodeError as e:
        print("JSON decoding error: ", str(e))

    except TypeError as e:
        print("Type error: ", str(e))
