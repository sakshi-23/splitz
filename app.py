from flask import Flask, render_template, request, jsonify
import os
import json
from pymongo import MongoClient



app = Flask(__name__)

db_name = 'splitpaydb'
client = None
db = None




port = int(os.getenv('PORT', 8000))

@app.route('/')
def home():
    return render_template('index.html')





if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port, debug=True)
