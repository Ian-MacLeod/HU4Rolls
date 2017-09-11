from hu4rolls import socketio, db
from .models import PokerTable, Player
from flask_socketio import emit, join_room
from flask import request


@socketio.on('clear table')
def clear_table(table_name):
    table = PokerTable.query.filter_by(name=table_name).first()
    table.seats[0].player_id = None
    table.seats[1].player_id = None
    db.session.commit()
    new_state = table.get_state()
    emit('new state', new_state, room=table_name)


@socketio.on('join table')
def join_table(table_name):
    if table_name and PokerTable.query.filter_by(name=table_name).first():
        join_room(table_name)
        emit('join table', table_name)


@socketio.on('get table list')
def send_table_list():
    table_list = PokerTable.get_lobby_table_list()
    emit('table list', table_list)


@socketio.on('get state')
def send_state(table_name):
    if Player.query.get(request.sid) is None:
        new_player = Player(request.sid)
        db.session.add(new_player)
        db.session.commit()
    table = PokerTable.query.filter_by(name=table_name).first()
    new_state = table.get_state()
    emit('new state', new_state)


@socketio.on('send chat')
def handle_message(chat):
    emit('chat message', chat['message'], room=chat['table_name'])


@socketio.on('take seat')
def seat_player(seat):
    if Player.query.get(request.sid) is None:
        new_player = Player(request.sid)
        db.session.add(new_player)
        db.session.commit()
    table = PokerTable.query.filter_by(name=seat['table_name']).first()
    new_state = table.seat_player(request.sid, seat['num'])
    if new_state is not None:
        emit('seated at', seat['num'])
        emit('new state', new_state, room=seat['table_name'])


@socketio.on('do action')
def do_action(action):
    table_name = action['table_name']
    table = PokerTable.query.filter_by(name=table_name).first()
    new_state = table.do_action(request.sid, action)
    if new_state is not None:
        emit('new state', new_state, room=table_name)


@socketio.on('disconnect')
def player_disconnect():
    tables = PokerTable.query.join(PokerTable.seats, aliased=True)\
        .filter_by(player_id=request.sid).all()
    for table in tables:
        new_state = table.remove_player(request.sid)
        if new_state is not None:
            emit('new state', new_state, room=table.name)


@socketio.on('leave table')
def player_leave(table_name):
    table = PokerTable.query.filter_by(name=table_name).first()
    new_state = table.remove_player(request.sid)
    if new_state is not None:
        emit('new state', new_state, room=table_name)
        emit('clear cards', room=table_name)
