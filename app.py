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
    files = request.files
    colors = request.form.to_dict()
    returnData = []
    #encode image to base 64 so it can be decoded on js side
    import base64
    #looping two times, because data keys can change, when a card is deleted
    #loop through files, append file data to returnData
    for index, file in enumerate(files.values()):
     hasFile = file.filename != ''
     returnData.append({})
     #add file string
     if(hasFile):
          returnData[index]["image"] = base64.b64encode(file.read()).decode("utf-8")
     else:
          returnData[index]["image"] = -1
     #loop through colors, append color data to returnData. enrich data with an # so css can read it as color
    for index, color in enumerate(colors.values()):
        returnData[index]["color"] = color
     
    returnData.reverse()
    return jsonify(returnData)
