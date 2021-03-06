from .hu4rolls import app, socketio, db
from . import poker
from sqlalchemy.ext.hybrid import hybrid_property
import random
import enum
import eventlet


class GameStage(enum.Enum):
    preflop = 0
    flop = 3
    turn = 4
    river = 5

    def next(self):
        cls = self.__class__
        members = list(cls)
        index = (members.index(self) + 1) % len(members)
        return members[index]


class User(db.Model):
    sid = db.Column(db.String, primary_key=True)

    def __init__(self, sid):
        self.sid = sid


class Seat(db.Model):
    poker_table_id = db.Column(db.Integer,
                               db.ForeignKey('poker_table.id'),
                               primary_key=True)
    number = db.Column(db.Integer, primary_key=True)
    user_sid = db.Column(db.String, db.ForeignKey('user.sid'))
    user = db.relationship('User')
    stack_size = db.Column(db.Integer)
    hand = db.Column(db.String)
    net_won = db.Column(db.Integer)
    amount_invested = db.Column(db.Integer)

    def __init__(self, number):
        self.number = number
        self.net_won = 0
        self.amount_invested = 0

    def clear(self):
        self.user_sid = None
        self.net_won = 0
        self.stack_size = None
        self.amount_invested = 0


class PokerTable(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), unique=True)
    seats = db.relationship('Seat',
                            order_by='Seat.number',
                            cascade="save-update, merge, delete")
    bb_size = db.Column(db.Integer)
    max_buyin_bbs = db.Column(db.Integer)
    community_cards = db.Column(db.String)
    pot_size = db.Column(db.Integer)
    bet_size = db.Column(db.Integer)
    total_bet_size = db.Column(db.Integer)
    button = db.Column(db.Integer)
    _active_seat = db.Column('active_seat', db.Integer)
    stage = db.Column(db.Enum(GameStage))
    hand_num = db.Column(db.Integer)
    action_num = db.Column(db.Integer)
    turn_duration = db.Column(db.Integer)

    @hybrid_property
    def active_seat(self):
        return self._active_seat

    @active_seat.setter
    def active_seat(self, value):
        if value is not None and self.turn_duration:
            eventlet.spawn(start_timeout(table_id=self.id,
                                         hand_num=self.hand_num,
                                         action_num=self.action_num,
                                         turn_duration=self.turn_duration))
        self._active_seat = value

    def __init__(self, name, turn_duration=30, bb_size=100, max_buyin_bbs=100,
                 num_seats=2):
        self.name = name
        self.turn_duration = turn_duration
        self.bb_size = bb_size
        self.max_buyin_bbs = max_buyin_bbs
        self.hand_num = 0
        self.action_num = 0
        self.pot_size = 0
        self.bet_size = 0
        self.community_cards = ''
        for i in range(num_seats):
            seat = Seat(i)
            self.seats.append(seat)

    @classmethod
    def get_lobby_table_list(cls):
        tables = [table.get_summary() for table in cls.query.all()]
        return tables

    def get_summary(self):
        return {'name': self.name,
                'numSeats': len(self.seats),
                'seatsTaken': len([s for s in self.seats if s.user_sid is not None])}

    def _is_valid_action(self, seat_num, action):
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
            return False
        return True

    def do_action(self, user_sid, action):
        users = [s.user_sid for s in self.seats]
        if user_sid in users:
            seat_num = users.index(user_sid)
        else:
            return
        should_do_showdown = False
        if self._is_valid_action(seat_num, action):
            if action['name'] == 'check':
                if seat_num == self.button or self.stage is GameStage.preflop:
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
                    should_do_showdown = True
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
            state = self.get_state()
            if should_do_showdown:
                db.session.expunge(self)
                eventlet.spawn(self.do_showdown)
            return state
        else:
            return False

    def advance_stage(self):
        self.active_seat = 1 - self.button
        self.bet_size = 0
        self.total_bet_size = 0
        for seat in self.seats:
            seat.amount_invested = 0
        if self.stage == GameStage.river:
            self.do_showdown()
        else:
            self.stage = self.stage.next()

    def start_new_hand(self):
        self.clear()
        self.hand_num += 1
        self.action_num = 0
        if self.button is None:
            self.button = random.choice(range(2))
        else:
            self.button = 1 - self.button
        self.active_seat = self.button
        self.put_in(self.button, self.bb_size // 2)
        self.put_in(1 - self.button, self.bb_size)
        self.deal_hands()

    def clear(self):
        self.pot_size = 0
        self.bet_size = 0
        self.total_bet_size = 0
        self.active_seat = None
        self.stage = GameStage.preflop
        for seat in self.seats:
            seat.stack_size = self.max_buyin_bbs * self.bb_size
            seat.amount_invested = 0

    def advance_active_seat(self):
        self.action_num += 1
        self.active_seat += 1
        self.active_seat %= len(self.seats)

    def seat_user(self, user_sid, seat_num):
        seat = self.seats[seat_num]
        if seat.user_sid is None and user_sid not in [s.user_sid for s in self.seats]:
            seat.user_sid = user_sid
            seat.net_won = 0
            seat.stack_size = self.max_buyin_bbs * self.bb_size
            if self.is_full():
                self.start_new_hand()
            db.session.commit()
            return self.get_state()

    def is_full(self):
        return all(s.user_sid for s in self.seats)

    def is_empty(self):
        return not any(s.user_sid for s in self.seats)

    def put_in(self, seat_num, amount):
        self.seats[seat_num].stack_size -= amount
        self.seats[seat_num].amount_invested += amount
        self.pot_size += amount
        new_bet_size = amount - self.bet_size
        self.total_bet_size += new_bet_size
        self.bet_size = new_bet_size

    def deal_hands(self):
        cards_needed = 2 * len(self.seats) + 5
        cards = [str(c) for c in poker.make_random_hand(cards_needed)]
        self.community_cards = ' '.join(cards[:5])
        socketio.emit('deal cards')
        for i in range(len(self.seats)):
            self.seats[i].hand = ' '.join(cards[2 * i + 5: 2 * i + 7])
            socketio.emit('show cards',
                          [[self.seats[i].hand.split(), i]],
                          room=self.seats[i].user_sid)

    def do_showdown(self):
        with app.app_context():
            db.session.add(self)
            socketio.emit('show cards',
                          [[self.seats[0].hand.split(), 0],
                           [self.seats[1].hand.split(), 1]],
                          room=self.name)
            while self.stage != GameStage.river:
                eventlet.sleep(1)
                self.stage = self.stage.next()
                db.session.commit()
                socketio.emit('new state', self.get_state(), room=self.name)
            seat0_hand = self.seat_hand_strength(0)
            seat1_hand = self.seat_hand_strength(1)
            if seat0_hand > seat1_hand:
                self.award_pot_to(0)
            elif seat0_hand < seat1_hand:
                self.award_pot_to(1)
            db.session.commit()
            eventlet.sleep(1)
            self.start_new_hand()
            db.session.commit()
            socketio.emit('new state', self.get_state(), room=self.name)

    def award_pot_to(self, seat_num):
        self.seats[seat_num].net_won += self.pot_size // 2
        self.seats[1 - seat_num].net_won -= self.pot_size // 2

    def seat_hand_strength(self, seat_num):
        card_strings = self.community_cards.split() + self.seats[seat_num].hand.split()
        hand = [poker.Card.from_str(s) for s in card_strings]
        return poker.evaluate_hand(hand)

    def remove_user(self, user_sid):
        did_remove_user = False
        for seat_num, seat in enumerate(self.seats):
            if seat.user_sid == user_sid:
                self.pot_size -= self.bet_size
                self.award_pot_to(1 - seat_num)
                seat.clear()
                self.clear()
                did_remove_user = True
        db.session.commit()
        return self.get_state() if did_remove_user else None

    def get_state(self):
        return {
            'seatList': [{'stackSize': seat.stack_size,
                          'netWon': seat.net_won,
                          'amountInvested': seat.amount_invested,
                          'isEmpty': not seat.user_sid} for seat in self.seats],
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


def start_timeout(table_id, hand_num, action_num, turn_duration):
    def timeout():
        eventlet.sleep(turn_duration)
        with app.app_context():
            table = PokerTable.query.get(table_id)
            if (hand_num == table.hand_num
                    and action_num == table.action_num
                    and table.active_seat is not None):
                db.session.add(table)
                new_state = table.do_action(table.seats[table.active_seat].user_sid,
                                            {'name': 'fold'})
                socketio.emit('new state', new_state, room=table.name)
    return timeout
