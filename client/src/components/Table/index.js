import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  standUp,
} from '../../actions';
import ActionWindow from './ActionWindow';
import Board from './Board';
import ChatWindow from './ChatWindow';
import Seat from './Seat';
import './styles.css';

class Table extends Component {
  constructor(props) {
    super(props);
    this.standUp = this.standUp.bind(this);
    this.backToLobby = this.backToLobby.bind(this);
  }

  componentDidMount() {
    this.context.socket.emit('join table', this.props.match.params.tableName);
  }

  standUp() {
    this.context.socket.emit('stand up', this.props.match.params.tableName);
    this.props.standUp();
  }

  backToLobby() {
    if (this.props.heroNum !== null) {
      this.standUp();
    }
    this.props.history.push('/');
  }

  render() {
    const isFacingLimp = (this.props.communityCards.length === 0
      && this.props.totalBetSize === this.props.BBSize);
    const totalInvested = this.props.seatList.reduce((a, b) => a + b.amountInvested, 0);
    const potSize = this.props.potSize - totalInvested;
    const isPlayerTurn = (
      this.props.heroNum !== null && this.props.heroNum === this.props.activeSeatNum);
    return (
      <div className="pokertable">
        <div className={`loading ${this.props.isLoading && 'active'}`} />
        <div className="felt">
          <div className="pot-size">
            {potSize && `Pot ${potSize}`}
          </div>
          <Seat
            seatInfo={this.props.seatList[0]}
            seatNum={0}
            cards={this.props.cardsBySeat[0]}
            isActive={this.props.activeSeatNum === 0}
            isButton={this.props.button === 0}
            tableName={this.props.match.params.tableName}
          />
          <Seat
            seatInfo={this.props.seatList[1]}
            seatNum={1}
            cards={this.props.cardsBySeat[1]}
            isActive={this.props.activeSeatNum === 1}
            isButton={this.props.button === 1}
            tableName={this.props.match.params.tableName}
          />
          <Board cards={this.props.communityCards} />
        </div>
        <ChatWindow />
        {isPlayerTurn &&
          <ActionWindow
            heroStackSize={this.props.seatList[this.props.heroNum].stackSize}
            betSize={this.props.betSize}
            potSize={this.props.potSize}
            totalBetSize={this.props.totalBetSize}
            BBSize={this.props.BBSize}
            isFacingLimp={isFacingLimp}
            amountInvested={this.props.seatList[this.props.heroNum].amountInvested}
            tableName={this.props.match.params.tableName}
          />
        }
        <div className="meta-buttons">
          <Button onClick={this.backToLobby}>Back to Lobby</Button>
          <Button onClick={this.standUp}>Stand Up</Button>
        </div>
      </div>
    );
  }
}

Table.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      tableName: PropTypes.string,
    }),
  }).isRequired,
  isLoading: PropTypes.bool.isRequired,
  heroNum: PropTypes.number.isRequired,
  communityCards: PropTypes.arrayOf(PropTypes.string).isRequired,
  totalBetSize: PropTypes.number.isRequired,
  BBSize: PropTypes.number.isRequired,
  seatList: PropTypes.arrayOf(PropTypes.shape({
    isEmpty: PropTypes.bool,
    stackSize: PropTypes.number,
    netWon: PropTypes.number,
    amountInvested: PropTypes.number,
  })).isRequired,
  potSize: PropTypes.number.isRequired,
  activeSeatNum: PropTypes.number.isRequired,
  button: PropTypes.number.isRequired,
  betSize: PropTypes.number.isRequired,
  cardsBySeat: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
  standUp: PropTypes.func.isRequired,
};

Table.contextTypes = {
  socket: PropTypes.object,
};

const mapStateToProps = state => state.table;

const mapDispatchToProps = dispatch => (
  {
    standUp: () => dispatch(standUp()),
  }
);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(Table));

