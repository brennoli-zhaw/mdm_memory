#request has built in request methods, jsonify can convert data to json
from flask import Flask, request, jsonify
#used to send files to client --> HTML etc.
from flask.helpers import send_file

app = Flask(__name__, static_url_path='/', static_folder='frontend')

@app.route("/")
def indexPage():
     return send_file("frontend/index.html")