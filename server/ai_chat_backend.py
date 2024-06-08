import json

from flask import Flask, render_template

from ai_chat import api_v2
from utils import limiter, rdb
from utils.time_based_auth import with_authorization

app = Flask(__name__)
app.register_blueprint(api_v2.blueprint, url_prefix="/api/v2")


@app.route("/")
def home():
    return render_template("home.html")


@app.post("/chat")
@limiter.limit("1/minute")
@limiter.limit("10/hour")
@with_authorization
def post_message():
    return {"error": "Please, update application"}, 400


@app.get("/chat/<uuid:context_id>/last")
def get_partial(context_id):
    root = f"ai:{context_id}"
    if not rdb.exists(root):
        return {"error": "Chat closed due to timeout"}, 404
    if rdb.get(f"{root}:lock") is None:
        return json.loads(rdb.lindex(root, -1)), 200
    return json.loads(rdb.blpop(f"{root}:partial", 0)[1]), 200


if __name__ == '__main__':
    app.run(port=8000, host="0.0.0.0", debug=True)
