from hu4rolls import app, poker, socketio
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import emit
import random
import enum
import eventlet

db = SQLAlchemy(app)


class GameStage(enum.Enum):
    preflop = 0
    flop = 3
    turn = 4
    river = 5

    def next(self):
        cls = self.__class__
        members = list(cls)
        index = members.index(self) + 1
        if index > len(members):
            index = 0
        return members[index]


class Player(db.Model):
    id = db.Column(db.String, primary_key=True)

    def __init__(self, sid):
        self.id = sid


class Seat(db.Model):
    poker_table_id = db.Column(db.Integer,
                               db.ForeignKey('poker_table.id'),
                               primary_key=True)
    number = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.String,
                          db.ForeignKey('player.id'))
    player = db.relationship('Player')
    stack_size = db.Column(db.Integer)
    hand = db.Column(db.String)
    net_won = db.Column(db.Integer)

    def __init__(self, number):
        self.number = number
        self.net_won = 0


class PokerTable(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), unique=True)
    seats = db.relationship('Seat', order_by='Seat.number')
    bb_size = db.Column(db.Integer)
    max_buyin_bbs = db.Column(db.Integer)
    community_cards = db.Column(db.String)
    pot_size = db.Column(db.Integer)
    bet_size = db.Column(db.Integer)
    total_bet_size = db.Column(db.Integer)
    button = db.Column(db.Integer)
    active_seat = db.Column(db.Integer)
    stage = db.Column(db.Enum(GameStage))

    def __init__(self, name, bb_size=100, max_buyin_bbs=100, num_seats=2):
        self.name = name
        self.bb_size = bb_size
        self.max_buyin_bbs = max_buyin_bbs
        for i in range(num_seats):
            seat = Seat(i)
            self.seats.append(seat)

    def _is_valid_action(self, seat_num, action):
        emit('active_seat', str(self.active_seat))
        if self.active_seat != seat_num:
            return False
        seat = self.seats[seat_num]
        if action['name'] == 'check':
            if self.bet_size != 0:
                return False
        elif action['name'] == 'bet':
            if (self.bet_size != 0
                    or action['size'] < self.bb_size
                    or action['size'] > seat.stack_size):
                return False
        elif action['name'] == 'raise':
            if (self.bet_size == 0
                    or (action['size'] < 2 * self.bet_size
                        and action['size'] != seat.stack_size)
                    or action['size'] > seat.stack_size):
                return False
        elif action['name'] == 'call':
            if self.bet_size == 0:
                return False
        elif action['name'] == 'fold':
            pass
        else:
            raise ValueError('Invalid action type')
        return True

    def do_action(self, player_sid, action):
        players = [s.player_id for s in self.seats]
        if player_sid in players:
            seat_num = players.index(player_sid)
        else:
            return
        if self._is_valid_action(seat_num, action):
            if action['name'] == 'check':
                if seat_num == self.button:
                    self.advance_stage()
                else:
                    self.advance_active_seat()
            elif action['name'] == 'bet':
                self.put_in(seat_num, action['size'])
                self.advance_active_seat()
            elif action['name'] == 'raise':
                self.put_in(seat_num, action['size'])
                self.advance_active_seat()
            elif action['name'] == 'call':
                self.put_in(seat_num, self.bet_size)
                if self.seats[seat_num].stack_size == 0:
                    self.active_seat = None
                    eventlet.spawn(self.do_showdown)
                elif (self.stage == GameStage.preflop
                      and self.total_bet_size == self.bb_size):
                    self.advance_active_seat()
                else:
                    self.advance_stage()
            elif action['name'] == 'fold':
                self.seats[seat_num].net_won -= (self.pot_size - self.bet_size) // 2
                self.seats[1 - seat_num].net_won += (self.pot_size - self.bet_size) // 2
                self.start_new_hand()
            db.session.commit()
            return self.get_state()

    def advance_stage(self):
        self.active_seat = 1 - self.button
        self.bet_size = 0
        self.total_bet_size = 0
        if self.stage == GameStage.river:
            self.do_showdown()
        else:
            self.stage = self.stage.next()

    def start_new_hand(self):
        self.stage = GameStage.preflop
        self.button = random.choice(range(2))
        self.active_seat = self.button
        self.pot_size = 0
        self.bet_size = 0
        self.total_bet_size = 0
        for seat in self.seats:
            seat.stack_size = self.max_buyin_bbs * self.bb_size
        self.put_in(self.button, self.bb_size // 2)
        self.put_in(1 - self.button, self.bb_size)
        self.deal_hands()

    def advance_active_seat(self):
        self.active_seat += 1
        self.active_seat %= len(self.seats)

    def seat_player(self, player_sid, seat_num):
        seat = self.seats[seat_num]
        if seat.player_id is None and player_sid not in [s.player_id for s in self.seats]:
            seat.player_id = player_sid
            seat.net_won = 0
            if self.is_full():
                self.start_new_hand()
            db.session.commit()
            return self.get_state()

    def is_full(self):
        return all(s.player_id for s in self.seats)

    def put_in(self, seat_num, amount):
        self.seats[seat_num].stack_size -= amount
        self.pot_size += amount
        new_bet_size = amount - self.bet_size
        self.total_bet_size += new_bet_size
        self.bet_size = new_bet_size

    def deal_hands(self):
        cards_needed = 2 * len(self.seats) + 5
        cards = [c.to_str() for c in poker.make_random_hand(cards_needed)]
        self.community_cards = ' '.join(cards[:5])
        for i in range(len(self.seats)):
            self.seats[i].hand = ' '.join(cards[2 * i + 5: 2 * i + 7])
            socketio.emit('deal cards',
                          [self.seats[i].hand.split(), i],
                          room=self.seats[i].player_id)

    def do_showdown(self):
        with app.app_context():
            db.session.add(self)
            socketio.emit('show cards',
                          [self.seats[0].hand.split(), self.seats[1].hand.split()])
            while self.stage != GameStage.river:
                eventlet.sleep(1)
                self.stage = self.stage.next()
                db.session.commit()
                socketio.emit('new state', self.get_state())
            seat0_hand = self.seat_hand_strength(0)
            seat1_hand = self.seat_hand_strength(1)
            if seat0_hand > seat1_hand:
                self.seats[0].net_won += self.pot_size // 2
                self.seats[1].net_won -= self.pot_size // 2
            elif seat0_hand < seat1_hand:
                self.seats[0].net_won -= self.pot_size // 2
                self.seats[1].net_won += self.pot_size // 2
            else:
                pass
            db.session.commit()
            eventlet.sleep(1)
            self.start_new_hand()
            db.session.commit()
            socketio.emit('new state', self.get_state())

    def seat_hand_strength(self, seat_num):
        card_strings = self.community_cards.split() + self.seats[seat_num].hand.split()
        hand = [poker.Card.from_str(s) for s in card_strings]
        return poker.evaluate_hand(hand)

    def remove_player(self, player_sid):
        new_state = None
        for seat in self.seats:
            if seat.player_id == player_sid:
                seat.player_id = None
                new_state = self.get_state()
        db.session.commit()
        return new_state

    def get_state(self):
        return {
            'seatList': [{'stackSize': seat.stack_size,
                          'netWon': seat.net_won,
                          'isEmpty': not seat.player_id} for seat in self.seats],
            'activeSeatNum': self.active_seat,
            'button': self.button,
            'BBSize': self.bb_size,
            'potSize': self.pot_size,
            'betSize': self.bet_size,
            'totalBetSize': self.total_bet_size,
            'communityCards': self.get_known_community_cards()
        }

    def get_known_community_cards(self):
        if self.stage is not None:
            return self.community_cards.split()[:self.stage.value]
        else:
            return []


"""
from pbkdf2 import pbkdf2_hmac, compare_digest
from random import SystemRandom
from flask_login import UserMixin




class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(15), unique=True)
    _hashed_password = db.Column(db.LargeBinary(120))
    _salt = db.Column(db.String(16))

    def set_password(self, new_pwd):
        if self._salt is None:
            self._salt = SystemRandom().getrandbits(128).to_bytes(16, byteorder='big')
        self._password = self._hash_password(new_pwd)

    def check_password(self, pwd):
        hashed_pwd = self._hash_password(pwd)
        return compare_digest(hashed_pwd, self._hashed_password)

    def _hash_password(self, pwd):
        pwd = pwd.encode("utf-8")
        salt = bytes(self._salt)
        buff = pbkdf2_hmac("sha512", pwd, salt, iterations=100000)
        return bytes(buff)

    def __repr__(self):
        return '<User {:d}'.format(self.id)
"""
