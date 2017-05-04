import React, { Component } from 'react';
const socket = require('socket.io-client')();
import './Table.css'

socket.on('connect', () => {
  console.log('connected');
});


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
  }

  componentDidMount() {
    socket.on('new state', state => {
      this.setState(state);
      console.log(state);
    });
    socket.on('deal cards', ([cards, seatNum]) => {
      this.showCardsAtSeat(cards, seatNum);
    });
    socket.on('seated at', (seatNum) => {
      this.setState({heroNum: seatNum});
    });
    socket.on('show cards', (cards) => {
      this.setState({'cardsBySeat': cards});
    })
    console.log('ready to receive');
    socket.emit('ready to receive');
  }

  clearTable() {
    socket.emit('clear table');
  }

  leaveTable(){
    socket.emit('leave table');
  }

  showCardsAtSeat(cards, playerNum) {
    console.log(cards, playerNum);
    let cardsBySeat = new Array(this.props.numSeats).fill([null, null]);
    cardsBySeat[playerNum] = cards;
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
                isButton={this.state.button === 0} />
          <Seat seatInfo={this.state.seatList[1]}
                seatNum={1}
                cards={this.state.cardsBySeat[1]}
                isActive={this.state.activeSeatNum === 1}
                isButton={this.state.button === 1} />
          <Board cards={this.state.communityCards} />
        </div>
        <ChatWindow />
        {this.state.heroNum !== null && this.state.heroNum === this.state.activeSeatNum &&
          <ActionWindow heroStackSize={this.state.seatList[this.state.heroNum].stackSize}
                        betSize={this.state.betSize}
                        potSize={this.state.potSize}
                        totalBetSize={this.state.totalBetSize}
                        BBSize={this.state.BBSize}
                        isFacingLimp={isFacingLimp}
                        amountInvested={this.state.seatList[this.state.heroNum].amountInvested} />
        }
        <button onClick={this.clearTable}>Clear Table</button>
        <button onClick={this.leaveTable}>Leave Table</button>
      </div>
    );
  }
}

class Seat extends Component {
  constructor() {
    super();
    this.handleSit = this.handleSit.bind(this);
  }

  handleSit() {
    socket.emit('sit down', this.props.seatNum);
    console.log('sitting at seat ' + this.props.seatNum);
  }

  render() {
    if (this.props.seatInfo.isEmpty){
      var contents = (
        <button onClick={this.handleSit}>Sit Here</button>
      );
    } else {
      var contents = (
        <div>
          <div className="top">
            Stack:
            {' ' + this.props.seatInfo.stackSize}
          </div>
          <div className="bot">
            Net:
            {' ' + this.props.seatInfo.netWon}
          </div>
        </div>
      );
    }
    let button = '';
    if (this.props.isButton){
      button = <div className="dealer-button">D</div>;
    }
    return (
      <div className={"seat " + "seat-" + this.props.seatNum + (this.props.isActive ? " active" : "")}>
        <Card card={this.props.cards[0]} />
        <Card card={this.props.cards[1]} />
        {button}
        <div className="invested">
          {this.props.seatInfo.amountInvested || ''}
        </div>
        {contents}
        <Timer />
      </div>
    );
  }
}

class Timer extends Component {
  render() {
    return (
      <div>
        {this.props.time_remaining}
      </div>
    );
  }
}

class Board extends Component {
  render() {
    const cards = this.props.cards
    const listItems = cards.map((card, index) =>
      <li key={index}>
        <Card card={card} />
      </li>
    );
    return (
      <ul className="board">
        {listItems}
      </ul>
    );
  }
}

class Card extends Component {
  render() {
    if (this.props.card) {
      var suit = this.props.card[1];
      var rank = this.props.card[0];
    } else {
      var suit = 'n';
      var rank = '';
    }
    return (
      <div className={"card " + "suit-" + suit}>
        <div>{rank}</div>
      </div>
    );
  }
}

class ChatWindow extends Component {
  constructor() {
    super();
    this.state = {messages: [],
                  messageInput: ''};
    this.sendMessage = this.sendMessage.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    socket.on('chat message', msg =>{
      this.setState({
        messages: this.state.messages.concat([msg])
      });
    });
  }

  componentDidUpdate() {
    let chatWindow = document.getElementById('chat-window');
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  sendMessage(event) {
    socket.emit('chat message', this.state.messageInput);
    this.setState({messageInput: ''});
    event.preventDefault();
  }

  handleChange(event) {
    this.setState({messageInput: event.target.value});
  }

  render() {
    return(
      <div className="chat">
        <div id="chat-window">
          {this.state.messages.map((msg, idx) =>
            <div key={idx}>{msg}</div>
          )}
          <div ref={(el) => { this.lastChat = el }}></div>
        </div>
        <form onSubmit={this.sendMessage}>
          <input type="text" className="chat-message" value={this.state.messageInput} onChange={this.handleChange} />
          <input type="submit" value="Send Message" />
        </form>
      </div>
    );
  }
}

class ActionWindow extends Component {
  constructor() {
    super();
    this.state = {inputBetSize: 0};
    this.handleInputChange = this.handleInputChange.bind(this);
    this.submitAction = this.submitAction.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.setBetToPotRatio = this.setBetToPotRatio.bind(this);
  }

  submitAction(action) {
    return (function() {
      console.log(this.getConstrainedBetSize(), this.props.totalBetSize, this.props.betSize);
      socket.emit('do action',
                  {'name': action,
                   'size': this.getConstrainedBetSize() - this.props.totalBetSize + this.props.betSize});
      this.setState({inputBetSize: 0});
    }).bind(this);
  }

  handleInputChange(event) {
    this.setState({inputBetSize: event.target.value});
  }

  handleKeyDown(action) {
    return (function(event) {
      if (event.key === 'Enter'){
        this.submitAction(action)();
      }
    }).bind(this);
  }

  getConstrainedBetSize(){
    let betSize = parseInt(this.state.inputBetSize) || 0;
    let minBetSize = this.props.totalBetSize + Math.max(this.props.betSize, this.props.BBSize);
    let maxBetSize = this.props.heroStackSize + this.props.totalBetSize - this.props.betSize;
    betSize = Math.max(minBetSize, betSize);
    betSize = Math.min(maxBetSize, betSize);
    return betSize;
  }

  setBetToPotRatio(ratio){
    return function(){
      let potSizeBet = (this.props.amountInvested + this.props.betSize
                        + ratio * (this.props.potSize + this.props.betSize));
      this.setState({inputBetSize: potSizeBet});
    }.bind(this)
  }

  render() {
    if (this.props.betSize){
      var aggressive_action = "raise";
      var aggressive_text = "Raise " + this.getConstrainedBetSize();
      var passive_action = "call";
      var passive_text = "Call " + this.props.betSize;
    } else {
      var aggressive_action = "bet";
      if (this.props.isFacingLimp){
        var aggressive_text = "Raise " + this.getConstrainedBetSize();
      } else {
        var aggressive_text = "Bet " + this.getConstrainedBetSize();
      }
      var passive_action = "check";
      var passive_text = "Check";
    }
    let aggressive_buttons = '';
    if (this.props.heroStackSize > this.props.betSize){
      aggressive_buttons = [
        <ActionButton handleClick={this.submitAction(aggressive_action)}
                      text={aggressive_text} />,
        <div className="bet-size-buttons">
          <button onClick={this.setBetToPotRatio(1)}>Pot</button>
          <button onClick={this.setBetToPotRatio(3/4)}>3/4 Pot</button>
          <button onClick={this.setBetToPotRatio(1/2)}>1/2 Pot</button>
        </div>,
        <input type="text" value={this.state.inputBetSize}
               onChange={this.handleInputChange}
               onKeyDown={this.handleKeyDown(aggressive_action)}/>
      ]
    }
    return (
      <div className="action-window">
        <ActionButton handleClick={this.submitAction("fold")} text="Fold" />
        <ActionButton handleClick={this.submitAction(passive_action)} text={passive_text} />
        {aggressive_buttons}
      </div>
    );
  }
}

class ActionButton extends Component {
  render() {
    return (
      <button onClick={this.props.handleClick}>
        {this.props.text}
      </button>
    )
  }
}

export default Table
