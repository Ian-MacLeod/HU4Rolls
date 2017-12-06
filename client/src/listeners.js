import {
  updateTableList,
  updateGameState,
  addChatMessage,
  takeSeat,
  dealCards,
  showCards,
  clearCards,
} from './actions';

const attachListeners = (socket, store) => {
  socket.on('table list', (tableList) => {
    store.dispatch(updateTableList(tableList));
  });
  socket.on('new state', (state) => {
    store.dispatch(updateGameState(state));
  });
  socket.on('chat message', (message) => {
    store.dispatch(addChatMessage(message));
  });
  socket.on('seated at', (seatNum) => {
    store.dispatch(takeSeat(seatNum));
  });
  socket.on('deal cards', () => {
    store.dispatch(dealCards());
  });
  socket.on('show cards', (cards) => {
    store.dispatch(showCards(cards));
  });
  socket.on('clear cards', () => {
    store.dispatch(clearCards());
  });
};

export default attachListeners;
