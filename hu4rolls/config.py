import os

basedir = os.path.abspath(os.path.dirname(__file__) + '/..')

DEBUG = os.environ.get('DEBUG', False)
TESTING = os.environ.get('TESTING', False)
SECRET_KEY = os.environ.get('SECRET_KEY', 'localkey')
SQLALCHEMY_DATABASE_URI = os.environ.get(
    'DATABASE_URL', 'sqlite:///' + os.path.join(basedir, 'db.sqlite'))
EMPTY_TABLES_PER_TYPE = 3
LOBBY_UPDATE_FREQUENCY_SECONDS = 10
