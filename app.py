from flask import Flask, render_template, request, jsonify
import os
from os import environ
import json
import pymongo
from pymongo import MongoClient
from bson.objectid import ObjectId
import sys
from random import randint
import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

db_name = 'heroku_g1h1jbmh'
user_collection = 'users'
vcards_request_collection = 'vcards_request'
vcards_collection = 'vcards'
groups_collection = 'groups'
transaction_collection = 'transactions'
user_transaction_collection = 'user_transactions'
notification_collection = 'notifications'
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
groups = db[groups_collection]
transactions = db[transaction_collection]
user_transactions = db[user_transaction_collection]
notifications = db[notification_collection]
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
    user = users.find_one({'facebook_id': new_user.get('facebook_id',"null")})
    if user is None:
        new_user['my_vcards'] = []
        new_user['vcards'] = []
        user = users.insert_one(new_user)
        user['user_id'] = str(list(user)[0]['inserted_id'])
    else:
        user['user_id'] = str(user['_id'])
    del(user['_id'])
    return json.dumps(user)



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


@app.route('/add_accounts', methods=['POST'])
def add_account():
    account_info = request.get_json(silent=True)
    user_id = account_info['user_id']
    accounts = account_info['accounts']
    users.update_one({'_id':ObjectId(user_id)}, {'$addToSet' : { 'accounts': {'$each':accounts}}})
    return 'Account Added'


@app.route('/create_group', methods=['POST'])
def create_group():
    group_info = request.get_json(silent=True)
    group_id = str(groups.insert_one(group_info).inserted_id)
    group_oid = group_info['owner_user_id']
    users.update_one({'_id': ObjectId(group_oid)}, {'$push': {'groups': group_id}})
    for member in group_info['members']:
        if 'user_id' in member:
            users.update_one({'_id':ObjectId(member['user_id'])}, {'$push': {'groups': group_id}})
        else:
            send_out_notification(member)
    return 'Group Created'


@app.route('/groups/<user_id>', methods=['GET'])
def get_user_groups(user_id):
    user = users.find_one({'_id':ObjectId(user_id)})
    user_groups = user['groups']
    groups_res = []
    for group in user_groups:
        group_info = groups.find_one({'_id':ObjectId(group)})
        group_info['group_id'] = str(group_info['_id'])
        del(group_info['_id'])
        groups_res.append(group_info)
    return json.dumps(groups_res)


@app.route('/create_vcard', methods=['POST'])
def create_card():
    virtual_card_info = request.get_json(silent=True)
    request_id = vcards_request.insert_one(virtual_card_info).inserted_id
    request_id = str(request_id)
    virtual_card = generate_virtual_card(request_id)
    owner_id = virtual_card_info['owner_user_id']
    owner_user = users.find_one_and_update({'_id': ObjectId(owner_id)}, {'$push': {'my_vcards': virtual_card['vcard_id'], 'vcard_req_ref': request_id }})
    accounts = virtual_card_info['accounts']
    for account in accounts:
        if account['user_exists'] :
            user_id = ''
            if 'facebook_id' in account:
                user_id = str(users.find_one({'facebook_id': account['facebook_id']})['_id'])
            elif 'user_id' in account:
                user_id = account['user_id']
            if len(user_id) !=0 and user_id != owner_id:
                n_obj = {}
                n_obj['user_id'] = user_id
                n_obj['message'] = owner_user['name'] + ' has created a spending card with max limit $'+virtual_card_info['amount']+'. ' \
                                   'You would be charged '+account['amount']+' % of the transactions'
                n_obj['status'] = 'pending'
                n_obj['status_code'] = 1
                notifications.insert_one(n_obj)
                users.update_one({'_id': ObjectId(user_id)}, {'$push': {'vcards': virtual_card['vcard_id'], 'vcard_req_ref': request_id}})
                send_app_notification(user_id, request_id)
        else:
            send_out_notification(account)
    del(virtual_card['_id'])
    return json.dumps(virtual_card)


@app.route('/user/<user_id>/vcards', methods=['GET'])
def get_user_cards(user_id):
    user = users.find_one({'_id':ObjectId(user_id)})
    user_vcards = user['vcards']
    user_vcards.extend(user['my_vcards'])
    cards = []
    for vcard in user_vcards:
        card = vcards.find_one({'_id': ObjectId(vcard)})
        card['vcard_id'] = vcard
        del(card['_id'])
        cards.append(card)
    return json.dumps(cards)


@app.route('/transact', methods=['POST'])
def transact():
    transaction_info = request.get_json(silent=True)
    transaction_info['date'] = str(datetime.datetime.now())
    transaction_id = transactions.insert_one(transaction_info).inserted_id
    transaction_id = str(transaction_id)
    vcard_ref = transaction_info['vcard_id']
    my_vcard = vcards.find_one_and_update({'_id':ObjectId(vcard_ref)}, {'$push': {'transactions': transaction_id}})
    vcard_req = vcards_request.find_one({'_id':ObjectId(my_vcard['vcard_req_ref'])})
    for account in vcard_req['accounts']:
        if account['user_exists']:
            transaction_info['transaction_id'] = transaction_id
            account['transaction_info'] = transaction_info
            user_transactions.insert_one(account).inserted_id
            n_obj = {}
            n_obj['user_id'] = account['user_id']
            n_obj['message'] = 'Purchase of '+transaction_info['amount']+' at '+transaction_info['merchant_name']+'' \
                            ' was made with split card '+ vcard_req['description']
            n_obj['status'] = 'pending'
            n_obj['status_code'] = 1
            notifications.insert_one(n_obj)
    transaction_res = {}
    transaction_res['transaction_id'] = transaction_id
    transaction_res['status'] = 'success'
    return json.dumps(transaction_res)


@app.route('/user/<user_id>/transactions', methods=['GET'])
def get_transactions_user(user_id):
    uts = user_transactions.find({'user_id':user_id})
    res_transactions = []
    for ut in uts:
        ut_dict = {}
        if 'payment_method' not in ut:
            ut_dict['status'] = 'pending'
        else:
            ut_dict['status'] = 'authorized'
        ut_dict['your_share'] = ut['amount']
        ut_dict['total_amount'] = ut['transaction_info']['amount']
        ut_dict['merchant_name'] = ut['transaction_info']['merchant_name']
        res_transactions.append(ut_dict)
    return json.dumps(res_transactions)

@app.route('/user/<user_id>/notifications', methods=['GET'])
def get_user_notifications(user_id):
    user_notifications = notifications.find({'user_id': user_id}).sort('status_code', pymongo.ASCENDING)
    n = []
    for un in user_notifications:
        un['notification_id'] = str(un['_id'])
        del(un['_id'])
        n.append(un)
    return json.dumps(n)


@app.route('/group/<group_id>/transactions', methods=['GET'])
def get_transactions_group(group_id):
    return []

@app.route('/vcard/<card_id>/transactions')
def get_transactions_card(card_id):
    cts = transactions.find({'vcard_id': card_id})
    cts_res = []
    for t in cts:
        t['transaction_id'] = str(t['_id'])
        del(t['_id'])
        cts_res.append(t)
    return json.dumps(cts_res)


@app.route('/manage_notification', methods=['POST'])
def manage_notification():
    nt = request.get_json(silent=True)
    nt_id = nt['notification_id']
    notifications.update_one({'_id':ObjectId(nt_id)}, {'$set' : {'status' : nt['status'], 'status_code' : 2}})
    return 'Notification status updated'


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
    card['vcard_id'] = card_id
    vcards_request.update_one({'_id':ObjectId(request_id)}, {'$set' : {"vcard_ref":card_id}})
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
