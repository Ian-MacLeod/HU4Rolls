import React, { Component } from 'react';
import './App.css';
import Table from './Table'
import Lobby from './Lobby'
const socket = require('socket.io-client')();


class App extends Component {
  constructor() {
    super();
    this.state = {openTable: null}
    this.toLobby = this.toLobby.bind(this)
  }

  componentDidMount() {
    socket.on('join table', table => {
      this.setState({openTable: table});
    });
  }

  toLobby() {
    this.setState({openTable: null});
  }

  render() {
    let content;
    if (this.state.openTable === null){
      content = <Lobby joinTable={this.joinTable} socket={socket} />
    } else {
      content = <Table numSeats={2}
                       socket={socket}
                       tableName={this.state.openTable}
                       toLobby={this.toLobby} />
    }
    return (
      <div>
        {content}
      </div>
    );
  }
}

export default App;
