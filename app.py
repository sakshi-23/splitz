from flask import Flask, render_template, request, jsonify
import os
from os import environ
import json
from pymongo import MongoClient

db_name = 'heroku_g1h1jbmh'
user_collection = 'users'

app = Flask(__name__)
uri = ''

if "MONGODB_URI" in os.environ:
    uri = environ.get('MONGODB_URI')
else:
    with open('mongo-cred.json') as f:
        uri = json.load(f)['uri']

client = MongoClient(uri)

db = client[db_name]

port = int(os.getenv('PORT', 8000))

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/register', methods=['POST'])
def create_user():
    users = db['users']
    id  = users.insert_one(request.get_json(silent=True)).inserted_id
    return '{user_id :'+str(id)+'}'



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port, debug=True)
