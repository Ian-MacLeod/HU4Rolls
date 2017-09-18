import os

from flask import Flask
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
import eventlet

from config import config

app = Flask(__name__, static_url_path='')
app.config.from_object(config[os.environ.get('HU4ROLLS_CONFIG', 'development')])

socketio = SocketIO(app)
db = SQLAlchemy(app)

import hu4rolls.utils
import hu4rolls.views
import hu4rolls.socketviews

eventlet.spawn(hu4rolls.utils.update_lobby)
