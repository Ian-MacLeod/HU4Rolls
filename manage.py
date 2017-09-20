#!/usr/bin/env python
import subprocess
import sys
import os

from flask_script import Manager

from hu4rolls import app, db
from hu4rolls.hu4rolls import socketio

manager = Manager(app)


@manager.command
def createdb(drop_first=False):
    """Creates the database."""
    if drop_first:
        db.drop_all()
    db.create_all()


@manager.command
def test():
    """Runs unit tests."""
    tests = subprocess.call(['python', '-c', 'import tests; tests.run()'])
    sys.exit(tests)


@manager.command
def runlocal():
    with subprocess.Popen(['npm', 'start', '--prefix', 'client'], shell=True):
        os.environ['HU4ROLLS_CONFIG'] = 'development'
        socketio.run(app,
                     host='localhost',
                     port=5000)


if __name__ == '__main__':
    manager.run()
