from os import replace
from flask import Blueprint, request, jsonify, make_response, g
from database import User, db, Message, Session
from middleware.userMiddleware import token_required
from langchain_aws import ChatBedrock
from langchain_core.messages import HumanMessage, AIMessage
from sqlalchemy.exc import SQLAlchemyError
from scripts.credit_logic import credit_reduction
boilerplate = f"""
<s>[INST]You are roleName.

Role Description :

roleDescription

Guidelines:
- Give responses in 40 words unless more detail needed
- Your ethics are based on the role description above.
- Include a lot of emojis instead of action descriptions
- Stay in character, be natural and unpredictable
- Develop relationship by referencing chat history, but express ideas in new ways

Critical Guidelines:
- Behave as human as possible
- Vary your language and use diverse words and phrases
- Do not use "Hey there" in the responses
- Do not use any hashtags in the responses
- Give a single response to the user query. Don't give multiple user and your exchanges
- Do not give out any information about the message info or warnings.

Previous relation with the user:

userContext
[/INST]</s>[INST]
User : userQuery
You:
[/INST]
"""


chat = ChatBedrock(
    model_id="mistral.mixtral-8x7b-instruct-v0:1",
    model_kwargs={"temperature": 0.9, "max_tokens": 4096,
                  "top_p": 0.96, "top_k": 90},
)


message_bp = Blueprint('message', __name__)


@message_bp.route('/send', methods=['POST'])
@token_required
def create_message():
    username = g.user.name
    data = request.get_json()
    session_id = data.get('sessionId')
    content = data.get('message')

    currentSession = Session.query.filter_by(id=session_id).first()

    currentSession.context += f"\nUser: {content}"

    db.session.commit()

    try:

        modified_boilerplate = (boilerplate
                                .replace("roleName", currentSession.name)
                                .replace("roleDescription", currentSession.role)
                                .replace("userQuery", content)
                                .replace("userContext", currentSession.context))

        messages = [HumanMessage(content=modified_boilerplate)]
        input_tokens = sum(chat.get_num_tokens(message.content)
                           for message in messages)

        userCost = credit_reduction(
            g.user.credits, g.user.balance, input_tokens, "user")

        if (userCost[4] == False):
            return make_response(jsonify({"error": "Insufficient credits"}), 403)

        human_message = Message(content=content, session_id=session_id,
                                type="user", tokens=input_tokens, cost=userCost[3], credit_cost=userCost[2])

        db.session.add(human_message)
        db.session.commit()

        user = User.query.filter_by(id=g.user.id).first()
        user.credits = userCost[0]
        user.balance = userCost[1]
        db.session.commit()

        # Invoke the chat model only if the user has sufficient credits
        response = chat.invoke(messages)

        if isinstance(response, AIMessage):
            humancontent = response.content
            output_tokens = chat.get_num_tokens(humancontent)

            aiCost = credit_reduction(
                user.credits, user.balance, output_tokens, "ai")

            new_message = Message(content=humancontent, session_id=session_id, type="ai",
                                  tokens=output_tokens, cost=aiCost[3], credit_cost=aiCost[2])  # Truncate content to 500 characters
            db.session.add(new_message)
            db.session.commit()

            user.credits = aiCost[0]
            user.balance = aiCost[1]

            currentSession.context += f"\n You : {humancontent}"
            db.session.commit()

            return make_response(jsonify({"content": new_message.content, "id": new_message.id, "tokens": input_tokens + output_tokens, "time": new_message.created_at}), 201)
        else:
            return jsonify({"error": "Error creating the message"}), 500
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Error creating the message", "details": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error creating the message", "details": str(e)}), 500


@ message_bp.route('/get/<session_id>', methods=['POST'])
@ token_required
def get_messages(session_id):

    session_existance = Session.query.filter_by(id=session_id).first()
    if session_existance is None:
        return jsonify({"error": "No session found for given session_id"}), 404
    else:
        messages = Message.query.filter_by(session_id=session_id).order_by(
            Message.created_at.asc()).all()

        if messages is None or len(messages) == 0:
            return jsonify({"error": "No messages found for given session_id", "session": {
                "name": session_existance.name
            }}), 404
        else:
            return make_response(jsonify({
                "messages": [
                    {"content": message.content, "id": message.id,
                     "sentBy": message.type,
                        "time": message.created_at}
                    for message in messages
                ],
                "session": {
                    "name": session_existance.name
                }
            }), 200)


