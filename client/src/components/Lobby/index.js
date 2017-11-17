import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { selectTable } from '../../actions';
import './styles.css';

class Lobby extends Component {
  constructor(props) {
    super(props);
    this.onJoinTable = this.onJoinTable.bind(this);
  }

  onJoinTable() {
    this.context.socket.emit('join table', this.props.selectedTable);
  }

  render() {
    const tableItems = this.props.tableList.map(tableInfo => (
      <tr
        key={tableInfo.name}
        className={tableInfo.name === this.props.selectedTable ? 'selected' : ''}
        onClick={this.props.onSelectTable(tableInfo.name)}
      >
        <td>{tableInfo.name}</td>
        <td>{tableInfo.seatsTaken}/{tableInfo.numSeats}</td>
      </tr>
    ));
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
        <button
          className="btn btn-default"
          onClick={this.onJoinTable}
        >
          Join Table
        </button>
      </div>
    );
  }
}

Lobby.propTypes = {
  tableList: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedTable: PropTypes.string.isRequired,
  hidden: PropTypes.bool.isRequired,
  onSelectTable: PropTypes.func.isRequired,
};

Lobby.contextTypes = {
  socket: PropTypes.object,
};

const mapStateToProps = (state) => {
  const { tableList, selectedTable } = state.lobby;
  return {
    tableList,
    selectedTable,
    hidden: state.table.name !== null,
  };
};

const mapDispatchToProps = dispatch => (
  { onSelectTable: tableName => () => dispatch(selectTable(tableName)) }
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Lobby);
