import React, { Component } from 'react';
import './Lobby.css'


class Lobby extends Component {
  constructor() {
    super();
    this.state = {tableList: [],
                  selectedTable: null};
    this.selectTable = this.selectTable.bind(this);
    this.joinTable = this.joinTable.bind(this);
  }

  componentDidMount() {
    this.props.socket.on('table list', tableList => {
      this.setState({tableList: tableList || []});
    });
    console.log('getting list')
    this.props.socket.emit('get table list');
    setTimeout(function(){
      console.log('getting list')
      this.props.socket.emit('get table list');
    }.bind(this), 1000);
  }

  selectTable(tableName) {
    return () => {
      this.setState({selectedTable: tableName});
    }
  }

  joinTable() {
    if (this.state.selectedTable !== null){
      this.props.socket.emit('join table', this.state.selectedTable);
    }
  }

  render() {
    const tableItems = this.state.tableList.map(tableInfo =>
      <li key={tableInfo.name}
          className={tableInfo.name === this.state.selectedTable ? 'selected' : ''}
          onClick={this.selectTable(tableInfo.name)}>
        {tableInfo.name}, {tableInfo.seatsTaken}/{tableInfo.numSeats}
      </li>
    );
    return (
      <div className={this.props.hidden ? 'hide' : ''}>
        <ul>
          {tableItems}
        </ul>
        <button onClick={this.joinTable}>Join Table</button>
      </div>
    )
  }
}

export default Lobby
