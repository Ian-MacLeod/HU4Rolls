/*
 * Action types
 */

 // Lobby
export const JOIN_TABLE = 'JOIN_TABLE';
export const LEAVE_TABLE = 'LEAVE_TABLE';
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

export const joinTable = (name) => {
  return {type: JOIN_TABLE, name};
};

export const leaveTable = () => {
  return {type: LEAVE_TABLE};
};

export const selectTable = (name) => {
  return {type: SELECT_TABLE, name};
}

export const updateTableList = (tableList) => {
  return {type: UPDATE_TABLE_LIST, tableList};
};

export const takeSeat = (seatNum) => {
  return {type: TAKE_SEAT, seatNum};
}

export const standUp = () => {
  return {type: STAND_UP};
};

export const dealCards = () => {
  return {type: DEAL_CARDS};
}

export const showCards = (handList) => {
  return {type: SHOW_CARDS, handList};
}

export const clearCards = () => {
  return {type: CLEAR_CARDS}
}

export const updateGameState = (newState) => {
  return {type: UPDATE_GAME_STATE, newState};
}

export const addChatMessage = (message) => {
  return {type: ADD_CHAT_MESSAGE, message};
}
