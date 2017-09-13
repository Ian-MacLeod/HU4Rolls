import unittest

from hu4rolls import app, db

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
