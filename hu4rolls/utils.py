from .models import PokerTable
from hu4rolls import app, db, socketio
import eventlet
import random

EMPTY_TABLES_PER_TYPE = 2
LOBBY_UPDATE_FREQUENCY = 10

ADJECTIVES = ["autumn", "hidden", "bitter", "misty", "silent",
              "reckless", "daunting", "short", "rising", "strong", "timber", "tumbling",
              "silver", "dusty", "celestial", "cosmic", "crescent", "double", "far",
              "terrestrial", "huge", "deep", "epic", "titanic", "mighty", "powerful"]
NOUNS = ["waterfall", "river", "breeze", "moon", "rain",
         "wind", "sea", "morning", "snow", "lake", "sunset", "pine", "shadow", "leaf",
         "sequoia", "cedar", "wrath", "blessing", "spirit", "nova", "storm", "burst",
         "giant", "elemental", "throne", "game", "weed", "stone", "apogee", "bang"]


def update_lobby():
    while True:
        adjust_number_of_tables()
        update_existing_tables()
        eventlet.sleep(LOBBY_UPDATE_FREQUENCY)


def update_existing_tables():
    with app.app_context():
        table_list = PokerTable.get_lobby_table_list()
        socketio.emit('table list', table_list)


def adjust_number_of_tables():
    with app.app_context():
        tables = PokerTable.query.all()
        empty_tables = [t for t in tables if t.is_empty()]
        if len(empty_tables) < EMPTY_TABLES_PER_TYPE:
            while True:
                new_name = generate_table_name()
                if not PokerTable.query.filter_by(name=new_name).first():
                    new_table = PokerTable(new_name)
                    db.session.add(new_table)
                    db.session.commit()
                    break
        if len(empty_tables) > EMPTY_TABLES_PER_TYPE:
            for t in empty_tables[EMPTY_TABLES_PER_TYPE:]:
                db.session.delete(t)
                db.session.commit()


def generate_table_name():
    adj = random.choice(ADJECTIVES)
    noun = random.choice(NOUNS)
    return adj + ' ' + noun
