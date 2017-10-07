from flask import Flask, render_template, request, jsonify
import os
from os import environ
import json
from pymongo import MongoClient
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

db_name = 'heroku_g1h1jbmh'
user_collection = 'users'



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
users = db['users']


port = int(os.getenv('PORT', 8000))

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/register', methods=['POST'])
def create_user():
    new_user = request.get_json(silent=True)
    print new_user['email_id']
    user = users.find_one({'email_id': new_user['email_id']})
    if user is None:
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


@app.route('/create_card', methods=['POST'])
def create_card():
    virtual_card_info = request.get_json(silent=True)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port, debug=True)
