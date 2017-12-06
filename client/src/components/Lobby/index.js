import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { selectTable } from '../../actions';
import './styles.css';

class Lobby extends Component {
  constructor(props) {
    super(props);
    this.onJoinTable = this.onJoinTable.bind(this);
  }

  onJoinTable() {
    this.props.history.push(`/table/${this.props.selectedTable}`);
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
      <div>
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
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
  tableList: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedTable: PropTypes.string.isRequired,
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
  };
};

const mapDispatchToProps = dispatch => (
  { onSelectTable: tableName => () => dispatch(selectTable(tableName)) }
);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(Lobby));
