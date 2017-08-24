import React, { Component } from 'react';
import ActionWindow from './ActionWindow';
import Board from './Board';
import Card from './Card';
import ChatWindow from './ChatWindow';
import Seat from './Seat';
import './styles.css';


class Table extends Component {
  constructor() {
    super();
    this.state = {
      seatList: [{
        stackSize: null,
        netWon: 0,
        amountInvested: 0,
        isEmpty: true
      },
      {
        stackSize: null,
        netWon: 0,
        amountInvested: 0,
        isEmpty: true
      }],
      activeSeatNum: null,
      button: 0,
      heroNum: null,
      potSize: 0,
      betSize: 0,
      totalBetSize: 0,
      communityCards: [],
      BBSize: 0,
      cardsBySeat: [[null, null], [null, null]]
    }
    this.clearTable = this.clearTable.bind(this);
    this.leaveTable = this.leaveTable.bind(this);
    this.backToLobby = this.backToLobby.bind(this);
  }

  componentDidMount() {
    this.props.socket.on('new state', state => {
      this.setState(state);
      console.log(state);
    });
    this.props.socket.on('deal cards', ([cards, seatNum]) => {
      this.showCardsAtSeat(cards, seatNum);
    });
    this.props.socket.on('seated at', (seatNum) => {
      this.setState({heroNum: seatNum});
    });
    this.props.socket.on('show cards', (cards) => {
      this.setState({'cardsBySeat': cards});
    })
    console.log('ready to receive');
    this.props.socket.emit('get state', this.props.tableName);
  }

  clearTable() {
    this.props.socket.emit('clear table', this.props.tableName);
  }

  leaveTable(){
    this.props.socket.emit('leave table', this.props.tableName);
  }

  backToLobby(){
    this.leaveTable();
    this.props.toLobby();
  }

  showCardsAtSeat(cards, seatNum) {
    console.log(cards, seatNum);
    console.log(this.props.numSeats)
    let cardsBySeat = new Array(this.props.numSeats).fill([null, null]);
    console.log(cardsBySeat);
    cardsBySeat[seatNum] = cards;
    this.setState({cardsBySeat: cardsBySeat});
  }

  render() {
    let isFacingLimp = (this.state.communityCards.length === 0
                        && this.state.totalBetSize === this.state.BBSize);
    let totalInvested = this.state.seatList.reduce(
      (a, b) => a + b.amountInvested, 0);
    let potSize = this.state.potSize - totalInvested;
    let investedString = potSize ? 'Pot ' + potSize : '';
    return(
      <div className="pokertable">
        <div className="felt">
          <div className="pot-size">
            {investedString}
          </div>
          <Seat seatInfo={this.state.seatList[0]}
                seatNum={0}
                cards={this.state.cardsBySeat[0]}
                isActive={this.state.activeSeatNum === 0}
                isButton={this.state.button === 0}
                tableName={this.props.tableName}
                socket={this.props.socket} />
          <Seat seatInfo={this.state.seatList[1]}
                seatNum={1}
                cards={this.state.cardsBySeat[1]}
                isActive={this.state.activeSeatNum === 1}
                isButton={this.state.button === 1}
                tableName={this.props.tableName}
                socket={this.props.socket} />
          <Board cards={this.state.communityCards} />
        </div>
        <ChatWindow tableName={this.props.tableName}
                    socket={this.props.socket} />
        {this.state.heroNum !== null && this.state.heroNum === this.state.activeSeatNum &&
          <ActionWindow heroStackSize={this.state.seatList[this.state.heroNum].stackSize}
                        betSize={this.state.betSize}
                        potSize={this.state.potSize}
                        totalBetSize={this.state.totalBetSize}
                        BBSize={this.state.BBSize}
                        isFacingLimp={isFacingLimp}
                        amountInvested={this.state.seatList[this.state.heroNum].amountInvested}
                        tableName={this.props.tableName}
                        socket={this.props.socket}/>
        }
        <div className="meta-buttons">
          <button onClick={this.backToLobby}>Back to Lobby</button>
          <button onClick={this.leaveTable}>Stand Up</button>
          <button onClick={this.clearTable}>Clear Table</button>
        </div>
      </div>
    );
  }
}

export default Table;