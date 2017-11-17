import {
  JOIN_TABLE,
  LEAVE_TABLE,
  UPDATE_GAME_STATE,
  TAKE_SEAT,
  STAND_UP,
  DEAL_CARDS,
  SHOW_CARDS,
  CLEAR_CARDS,
  ADD_CHAT_MESSAGE,
} from '../actions';

const initialState = {
  name: null,
  seatList: [{
    stackSize: null,
    netWon: 0,
    amountInvested: 0,
    isEmpty: true,
  },
  {
    stackSize: null,
    netWon: 0,
    amountInvested: 0,
    isEmpty: true,
  }],
  activeSeatNum: null,
  button: null,
  heroNum: null,
  potSize: 0,
  betSize: 0,
  totalBetSize: 0,
  communityCards: [],
  BBSize: 0,
  cardsBySeat: [[null, null], [null, null]],
  numSeats: 2,
  chatMessages: [],
};

const table = (state = initialState, action) => {
  switch (action.type) {
    case JOIN_TABLE:
      return Object.assign({}, state, { name: action.name });
    case LEAVE_TABLE:
      return Object.assign({}, initialState);
    case UPDATE_GAME_STATE:
      return Object.assign({}, state, action.newState);
    case TAKE_SEAT:
      return Object.assign({}, state, { heroNum: action.seatNum });
    case STAND_UP:
      return Object.assign({}, state, { heroNum: null });
    case DEAL_CARDS: {
      const newCardsBySeat = [];
      for (let i = 0; i < state.numSeats; i++) {
        newCardsBySeat.push(['unknown', 'unknown']);
      }
      return Object.assign({}, state, { cardsBySeat: newCardsBySeat });
    }
    case SHOW_CARDS: {
      const newCardsBySeat = Object.assign({}, state.cardsBySeat);
      action.handList.forEach((hand, seatNum) => { newCardsBySeat[seatNum] = hand; });
      return Object.assign({}, state, { cardsBySeat: newCardsBySeat });
    }
    case CLEAR_CARDS:
      return Object.assign({}, state, { cardsBySeat: initialState.cardsBySeat });
    case ADD_CHAT_MESSAGE: {
      const chatMessages = [...state.chatMessages, action.message];
      return Object.assign({}, state, { chatMessages });
    }
    default:
      return state;
  }
};

export default table;
