import React from 'react';
import { Route } from 'react-router-dom';
import Table from './Table';
import Lobby from './Lobby';

const App = () => (
  <div className="content">
    <h1>HU4Rolls</h1>
    <Route exact path="/" component={Lobby} />
    <Route path="/table/:tableName?" component={Table} />
  </div>
);

export default App;
