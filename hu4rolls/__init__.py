from flask import Flask
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
import eventlet

app = Flask(__name__, static_url_path='')
app.config.from_pyfile('config.py')
app.config.from_envvar('HU4ROLLS_SETTINGS', silent=True)
socketio = SocketIO(app)
db = SQLAlchemy(app)

import hu4rolls.utils
import hu4rolls.views
import hu4rolls.socketviews

eventlet.spawn(hu4rolls.utils.update_lobby)
