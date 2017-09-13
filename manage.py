#!/usr/bin/env python
import subprocess
import sys

from flask_script import Manager

from hu4rolls import app, db

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


if __name__ == '__main__':
    manager.run()
