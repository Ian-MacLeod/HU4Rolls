import React, { Component } from 'react';
import './styles.css';


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
      let new_state = {tableList: tableList || []};
      if(tableList.length && tableList.indexOf(this.state.selectedTable) === -1){
        new_state.selectedTable = tableList[0].name;
      }
      this.setState(new_state);
    });
    console.log('getting list');
    this.props.socket.emit('get table list');
    setTimeout(function(){
      console.log('getting list');
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
      <tr key={tableInfo.name}
          className={tableInfo.name === this.state.selectedTable ? 'selected' : ''}
          onClick={this.selectTable(tableInfo.name)}>
        <td>{tableInfo.name}</td>
        <td>{tableInfo.seatsTaken}/{tableInfo.numSeats}</td>
      </tr>
    );
    return (
      <div className={this.props.hidden ? 'hide' : ''}>
        <h2>Join a table to play:</h2>
        <table className="table table-bordered tables">
          <tbody>
            <tr>
              <td>
                Table Name
              </td>
              <td>
                Players
              </td>
            </tr>
            {tableItems}
          </tbody>
        </table>
        <button className="btn btn-default"
                onClick={this.joinTable}>Join Table</button>
      </div>
    )
  }
}

export default Lobby;
