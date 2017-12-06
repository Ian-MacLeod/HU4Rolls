import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import socketio from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import App from './components/App';
import SocketProvider from './components/SocketProvider';
import reducer from './reducers';
import attachListeners from './listeners';
import './index.css';

const socket = socketio();
const store = createStore(
  reducer,
  // eslint-disable-next-line no-underscore-dangle
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);
attachListeners(socket, store);

ReactDOM.render(
  (
    <Provider store={store}>
      <SocketProvider socket={socket}>
        <Router>
          <Route path="/" component={App} />
        </Router>
      </SocketProvider>
    </Provider>
  ),
  document.getElementById('root'),
);
