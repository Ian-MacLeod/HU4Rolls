import React, { Component } from 'react';
import './Lobby.css'


class Lobby extends Component {
  constructor() {
    super();
    this.state = {tableList: ['test', 'a', 'b', 'c'],
                  selectedTable: null};
    this.selectTable = this.selectTable.bind(this);
    this.joinTable = this.joinTable.bind(this);
  }

  componentDidMount() {
    this.props.socket.on('table list', tableList => {
      this.setState({tableList: tableList});
    });
    this.props.socket.emit('get table list');
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
    const tableItems = this.state.tableList.map(tableName =>
      <li key={tableName}
          className={tableName === this.state.selectedTable ? 'selected' : ''}
          onClick={this.selectTable(tableName)}>
        {tableName}
      </li>
    );
    return (
      <div>
        <ul>
          {tableItems}
        </ul>
        <button onClick={this.joinTable}>Join Table</button>
      </div>
    )
  }
}

export default Lobby
