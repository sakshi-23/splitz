from flask import Flask, render_template, request, jsonify
import os
from os import environ
import json
from pymongo import MongoClient
import sys
from random import randint

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

db_name = 'heroku_g1h1jbmh'
user_collection = 'users'
vcards_request_collection = 'vcards_request'
vcards_collection = 'vcards'



app = Flask(__name__)


# Setup MongoDB
uri = ''
if "MONGODB_URI" in os.environ:
    uri = environ.get('MONGODB_URI')
else:
    with open('mongo-cred.json') as f:
        uri = json.load(f)['uri']
client = MongoClient(uri)
db = client[db_name]
users = db[user_collection]
vcards_request = db[vcards_request_collection]
vcards = db[vcards_collection]

#------------------------------

port = int(os.getenv('PORT', 8000))

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/shopping')
def shopping():
    return render_template('shopping.html')

@app.route('/register', methods=['POST'])
def create_user():
    new_user = request.get_json(silent=True)
    user = users.find_one({'email_id': new_user['email_id']})
    if user is None:
        new_user['my_vcards'] = []
        new_user['vcards'] = []
        id = users.insert_one(new_user).inserted_id
        return '{user_id :'+str(id)+'}'
    else:
        return 'User exists'


@app.route('/login', methods=['POST'])
def login():
    check_user = request.get_json(silent=True)
    user = users.find_one({'email_id': check_user['email_id']})
    if user is not None:
        if user['password'] == check_user['password']:
            id = str(user.get('_id'))
            del user['_id']
            user['id'] = id
            return json.dumps(user)
        else :
            return 'Invalid credentials'
    else:
        return 'User does not exist'


@app.route('/create_vcard', methods=['POST'])
def create_card():
    virtual_card_info = request.get_json(silent=True)
    request_id = vcards_request.insert_one(virtual_card_info).inserted_id
    request_id = str(request_id)
    virtual_card = generate_virtual_card(request_id)
    owner_id = virtual_card_info['owner_user_id']
    users.update_one({'_id':owner_id }, {'$push': {'my_vcards': str(request_id)}})
    accounts = virtual_card_info['accounts']
    for account in accounts:
        if account['user_exists'] :
            user_id = account['user_id']
            amount  = account['amount']
            payment_methods = {}
            payment_methods['vcard_ref'] = request_id
            payment_details = {}
            payment_details['amount'] = amount
            if 'payment_specified' in account :
                payment_details['payment_method'] = account['payment_method']
            payment_methods['payment_details'] = payment_details
            users.update_one({'_id': user_id}, {'$push': {'vcards': payment_methods}})
            send_app_notification(user_id, request_id)
        else:
            send_out_notification(account)
    del(virtual_card['_id'])
    return json.dumps(virtual_card)




def generate_virtual_card(request_id):
    card_number = random_with_N_digits(16)
    ccv = random_with_N_digits(3)
    card = vcards.find_one({'card_number' : card_number})
    while card is not None:
        card_number = random_with_N_digits(16)
        card = vcards.find_one({'card_number': card_number})
    card = {}
    card['card_number'] = card_number
    card['ccv'] = ccv
    card['exp'] = '01/21'
    card['vcard_req_ref'] = request_id
    card_id = vcards.insert_one(card).inserted_id
    card_id = str(card_id)
    vcards_request.update_one({'_id':request_id}, {'$set' : {"vcard_ref":card_id}})
    return card

def random_with_N_digits(n):
    range_start = 10 ** (n - 1)
    range_end = (10 ** n) - 1
    return str(randint(range_start, range_end))


def send_app_notification(user_id, request_id):
    print("In app notification sent to "+str(user_id))

def send_out_notification(account):
    #add twilio part here
    print (account)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port, debug=True)
