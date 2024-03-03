#request has built in request methods, jsonify can convert data to json
from flask import Flask, request, jsonify
#used to send files to client --> HTML etc.
from flask.helpers import send_file

app = Flask(__name__, static_url_path='/', static_folder='frontend')

@app.route("/")
def indexPage():
     return send_file("frontend/index.html")

@app.post('/retrieveCards')
def dataAnalyze():
    data = request.files
    print(data)
    #encode image to base 64 so it can be decoded on js side
    import base64
    imageStrings = []
    for file in data.values():
     imageStrings.append(base64.b64encode(file.read()).decode("utf-8"))
    print(data)
    return jsonify(imageStrings)
