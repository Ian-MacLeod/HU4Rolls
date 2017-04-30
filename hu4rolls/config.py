import os
DEBUG = os.environ['DEBUG'] if 'DEBUG' in os.environ else False
DEBUG = os.environ['TESTING'] if 'TESTING' in os.environ else False
SECRET_KEY = os.environ['SECRET_KEY'] if 'SECRET_KEY' in os.environ else 'localkey'
SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL']
