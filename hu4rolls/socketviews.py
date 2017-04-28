from hu4rolls import socketio
from .models import db, PokerTable, Player
from flask_socketio import emit
from flask import request


@socketio.on('clear table')
def clear_table():
    table = PokerTable.query.get(1)
    table.seats[0].player_id = None
    table.seats[1].player_id = None
    db.session.commit()
    new_state = table.get_state()
    emit('new state', new_state, broadcast=True)


@socketio.on('ready to receive')
def send_state():
    if Player.query.get(request.sid) is None:
        new_player = Player(request.sid)
        db.session.add(new_player)
        db.session.commit()
    table = PokerTable.query.get(1)
    new_state = table.get_state()
    emit('new state', new_state)


@socketio.on('chat message')
def handle_message(message):
    emit('chat message', message, broadcast=True)


@socketio.on('sit down')
def seat_player(seat_num):
    if Player.query.get(request.sid) is None:
        new_player = Player(request.sid)
        db.session.add(new_player)
        db.session.commit()
    table = PokerTable.query.get(1)
    new_state = table.seat_player(request.sid, seat_num)
    if new_state is not None:
        emit('seated at', seat_num)
        emit('new state', new_state, broadcast=True)


@socketio.on('do action')
def do_action(action):
    table = PokerTable.query.get(1)
    new_state = table.do_action(request.sid, action)
    if new_state is not None:
        emit('new state', new_state, broadcast=True)


@socketio.on('disconnect')
def player_disconnect():
    table = PokerTable.query.get(1)
    new_state = table.remove_player(request.sid)
    if new_state is not None:
        emit('new state', new_state, broadcast=True)


@socketio.on('leave table')
def player_leave():
    table = PokerTable.query.get(1)
    new_state = table.remove_player(request.sid)
    if new_state is not None:
        emit('new state', new_state, broadcast=True)
