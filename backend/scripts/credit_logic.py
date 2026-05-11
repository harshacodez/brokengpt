import json
import re
from flask import g, jsonify
from database import db

plans = {
    3: {
        'multiplier': 40,
        'credits': 100,
        'net': 0.1
    },
    2: {
        'net': 15.86,
        'multiplier': 3,
        'credits': 50000
    },
    1: {
        'net': 4.41,
        'multiplier': 9,
        'credits': 7000
    },
    0: {
        'net': 1.16,
        'multiplier': 15,
        'credits': 1500
    }
}


def databaseUpdation(credits, dollars, indice):
    # Parse the JSON strings into Python lists
    user_credits = json.loads(g.user.credits)
    user_balance = json.loads(g.user.balance)

    # Ensure indice is within the bounds of the list
    if not (0 <= indice < len(user_credits)):
        raise IndexError("Index out of range for credits or balance.")

    if (credits > get_total_credits(g.user.credits)):
        return False

    # Update the credits
    user_credits[indice] -= credits

    # Update the balance if the index is not 3
    if indice != 3:
        user_balance[indice] -= dollars

    # Convert the updated lists back to JSON strings
    g.user.credits = json.dumps(user_credits)
    g.user.balance = json.dumps(user_balance)

    # Commit the changes to the database
    db.session.commit()

    return True


def get_total_credits(credits):
    try:
        credit_list = json.loads(credits)
        total_credits = sum((value) for value in credit_list)
        return total_credits
    except json.JSONDecodeError as e:
        print("JSON error")


def get_total_amount(amount):
    try:
        amount_list = json.loads(amount)
        total_amount = sum(int(value) for value in amount_list)
        return total_amount

    except json.JSONDecodeError as e:
        print("JSON error")


def get_Indices(prompt, word):
    return [match.start() for match in re.finditer(re.escape(word), prompt)]


def prompt_completion(prompt, insertion_text, index):
    return prompt[:index] + insertion_text + prompt[index:]


# CREDIT REDUCTION LOGIC


def getHighestIndice(credit_list):
    return credit_list.index(max(credit_list))


def dollarToCredit(dollar, indice):
    credits = plans[indice]['credits']
    net = plans[indice]['net']

    cost = round(((dollar * credits) / net), 2)

    return cost


def calculateCost(tokens, type, indice):
    awsBase = (4.5 * (10 ** -7)) if type == 'user' else (7*(10 ** -7))
    awsCost = tokens * awsBase
    userCost = plans[indice]['multiplier'] * awsCost
    return userCost


def deductCredits(credit_list, balance_list, indice, tokens, type):
    dollarCost = calculateCost(tokens, type, indice)
    creditCost = dollarToCredit(dollarCost,  indice)

    credit_list[indice] -= creditCost
    if indice != 3:
        balance_list[indice] -= dollarCost

    return return_function(credit_list, balance_list, creditCost, dollarCost, indice)


def return_function(credit_list, balance_list, creditCost, dollarCost, indice):
    creditStatus = databaseUpdation(creditCost, dollarCost, indice)
    return [json.dumps(credit_list), json.dumps(balance_list), creditCost, dollarCost, creditStatus]


def credit_reduction(credit_json, balance_json, tokens, type):
    balance_list = json.loads(balance_json)
    credits_list = json.loads(credit_json)

    highestIndice = getHighestIndice(credits_list)

    return deductCredits(credits_list, balance_list, highestIndice, tokens, type)
