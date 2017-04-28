import React, { Component } from 'react';
import './App.css';
import Table from './Table'


class App extends Component {
  render() {
    return (
      <div>
        <Table numSeats={2} />
      </div>
    );
  }
}

export default App;
