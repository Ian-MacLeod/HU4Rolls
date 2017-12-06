/*
 * Action types
 */

// Lobby
export const SELECT_TABLE = 'SELECT_TABLE';
export const UPDATE_TABLE_LIST = 'UPDATE_TABLE_LIST';

// Table
export const TAKE_SEAT = 'TAKE_SEAT';
export const STAND_UP = 'STAND_UP';
export const DEAL_CARDS = 'DEAL_CARDS';
export const SHOW_CARDS = 'SHOW_CARDS';
export const CLEAR_CARDS = 'CLEAR_CARDS';
export const UPDATE_GAME_STATE = 'UPDATE_GAME_STATE';

// Chat
export const ADD_CHAT_MESSAGE = 'ADD_CHAT_MESSAGE';


/*
 * Action creators
 */

export const selectTable = name => (
  { type: SELECT_TABLE, name }
);

export const updateTableList = tableList => (
  { type: UPDATE_TABLE_LIST, tableList }
);

export const takeSeat = seatNum => (
  { type: TAKE_SEAT, seatNum }
);

export const standUp = () => (
  { type: STAND_UP }
);

export const dealCards = () => (
  { type: DEAL_CARDS }
);

export const showCards = handList => (
  { type: SHOW_CARDS, handList }
);

export const clearCards = () => (
  { type: CLEAR_CARDS }
);

export const updateGameState = newState => (
  { type: UPDATE_GAME_STATE, newState }
);

export const addChatMessage = message => (
  { type: ADD_CHAT_MESSAGE, message }
);
