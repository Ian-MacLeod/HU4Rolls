import unittest

from hu4rolls import app, db
from hu4rolls.models import PokerTable, User, GameStage

app.config['TESTING'] = True


class HU4RollsTestCase(unittest.TestCase):
    def setUp(self):
        db.drop_all()
        db.create_all()
        self.client = app.test_client()

    def tearDown(self):
        db.drop_all()


class HomePageTest(HU4RollsTestCase):
    def test_home_page(self):
        rv = self.client.get('/')
        self.assertIn(b'HU4Rolls', rv.get_data())


class PokerTableModelTest(HU4RollsTestCase):
    def setUp(self):
        super().setUp()
        self.table = PokerTable('Test table')
        self.user1 = User(sid='2')
        self.user2 = User(sid='1')
        db.session.add(self.table)
        db.session.add(self.user1)
        db.session.add(self.user2)
        db.session.commit()

    def seat_users(self):
        self.table.seat_user(self.user1.sid, 0)
        self.table.seat_user(self.user2.sid, 1)

    def test_can_seat_users_and_starts_hand(self):
        self.seat_users()

        # Test that users are in fact seated
        self.assertEqual(self.table.seats[0].user, self.user1)
        self.assertEqual(self.table.seats[1].user, self.user2)
        self.assertTrue(self.table.is_full())
        self.assertFalse(self.table.is_empty())

        # Test that hand starts
        self.assertEqual(self.table.hand_num, 1)
        self.assertEqual(self.table.stage, GameStage.preflop)
        self.assertTrue(self.table.seats[0].hand)
        self.assertEqual(self.table.pot_size, self.table.bb_size * 1.5)

    def test_can_bet_only_legal_sizes(self):
        self.seat_users()
        active_seat = self.table.active_seat
        active_user_sid = self.table.seats[active_seat].user_sid

        # Test that bet size can't be less than pot
        action = {'name': 'raise',
                  'size': self.table.bb_size - 1}
        result = self.table.do_action(active_user_sid, action)
        self.assertFalse(result)

        # Test that bet size can't be greater than stack size
        action = {'name': 'raise',
                  'size': self.table.bb_size * 100 + 1}
        result = self.table.do_action(active_user_sid, action)
        self.assertFalse(result)

        # Test that we can raise to a legal amount
        action = {'name': 'raise',
                  'size': 250}
        result = self.table.do_action(active_user_sid, action)
        self.assertTrue(result)
