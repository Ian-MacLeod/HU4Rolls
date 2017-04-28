from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__, static_url_path='')
app.config.from_pyfile('config.py')
app.config.from_envvar('HU4ROLLS_SETTINGS', silent=True)
socketio = SocketIO(app)

import hu4rolls.views
import hu4rolls.socketviews
