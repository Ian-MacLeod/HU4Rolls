import coverage
import unittest
import os
import sys


cov = coverage.Coverage(branch=True)
cov.start()

os.environ['DATABASE_URL'] = 'sqlite://'
from hu4rolls import app, db
from hu4rolls.models import Seat, PokerTable
app.config['TESTING'] = True


class FlackTests(unittest.TestCase):
    def setUp(self):
        db.drop_all()  # just in case
        db.create_all()
        self.client = app.test_client()

    def tearDown(self):
        db.drop_all()

    def test_home_page(self):
        rv = self.client.get('/')
        self.assertIn(b'HU4Rolls', rv.get_data())


if __name__ == '__main__':
    tests_ok = unittest.main(verbosity=2, exit=False).result.wasSuccessful()

    # print coverage report
    cov.stop()
    print('')
    cov.report(omit=['tests.py', 'venv/*'])

    # exit code (1: tests failed, 2: lint failed, 3: both failed)
    sys.exit(0 if tests_ok else 1)
