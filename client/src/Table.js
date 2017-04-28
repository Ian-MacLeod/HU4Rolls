import React, { Component } from 'react';
const socket = require('socket.io-client')();

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
        isEmpty: true
      },
      {
        stackSize: null,
        netWon: 0,
        isEmpty: true
      }],
      activeSeatNum: null,
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
    return(
      <div className="table">
        <div>
          Pot Size:
          {this.state.potSize - this.state.betSize}
        </div>
        <div>
          Bet Size:
          {this.state.betSize}
        </div>
        <Seat seatInfo={this.state.seatList[0]}
              seatNum={0}
              cards={this.state.cardsBySeat[0]}
              isActive={this.state.activeSeatNum === 0} />
        <Seat seatInfo={this.state.seatList[1]}
              seatNum={1}
              cards={this.state.cardsBySeat[1]}
              isActive={this.state.activeSeatNum === 1} />
        <Board cards={this.state.communityCards} />
        <ChatWindow />
        {this.state.heroNum !== null && this.state.heroNum === this.state.activeSeatNum &&
          <ActionWindow heroStackSize={this.state.seatList[this.state.heroNum].stackSize}
                        betSize={this.state.betSize}
                        totalBetSize={this.state.totalBetSize}
                        BBSize={this.state.BBSize} />
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
    return (
      <div className={this.props.isActive && "active"}>
        <Card card={this.props.cards[0]} />
        <Card card={this.props.cards[1]} />
        <div>
          Stack Size:
          {this.props.seatInfo.stackSize}
        </div>
        <div>
          Net Won:
          {this.props.seatInfo.netWon}
        </div>
        {this.props.isActive &&
          <div>
            Active
          </div>
        }
        {this.props.seatInfo.isEmpty &&
          <div>
            <button onClick={this.handleSit}>Sit Here</button>
          </div>
        }
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
      <ul>
        {listItems}
      </ul>
    );
  }
}

class Card extends Component {
  render() {
    return (
      <div className="card">
        <img src={this.props.card + '.svg'} alt={this.props.card} />
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
      <div>
        <ul className="messages">
          {this.state.messages.map((msg, idx) =>
            <li key={idx}>{msg}</li>
          )}
        </ul>
        <form onSubmit={this.sendMessage}>
          <input type="text" value={this.state.messageInput} onChange={this.handleChange} />
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
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(action) {
    return (function() {
      console.log(this.getConstrainedBetSize(), this.props.totalBetSize, this.props.betSize);
      socket.emit('do action',
                  {'name': action,
                   'size': this.getConstrainedBetSize() - this.props.totalBetSize + this.props.betSize});
    }).bind(this);
    this.setState({inputBetSize: 0})
  }

  handleInputChange(event) {
    this.setState({inputBetSize: event.target.value});
  }

  getConstrainedBetSize(){
    let betSize = parseInt(this.state.inputBetSize) || 0;
    let minBetSize = this.props.totalBetSize + Math.max(this.props.betSize, this.props.BBSize);
    let maxBetSize = this.props.heroStackSize + this.props.totalBetSize - this.props.betSize;
    betSize = Math.max(minBetSize, betSize);
    betSize = Math.min(maxBetSize, betSize);
    return betSize;
  }

  render() {
    let action_buttons = null;
    if (this.props.betSize){
      action_buttons = [<ActionButton handleClick={this.handleClick}
                                      actionName="call"
                                      text={"Call " + this.props.betSize} />];
      if (this.props.heroStackSize > this.props.betSize) {
        action_buttons.push(<ActionButton handleClick={this.handleClick}
                                          actionName="raise"
                                          text={"Raise " + this.getConstrainedBetSize()} />);
      }
    } else {
      action_buttons = [
        <ActionButton handleClick={this.handleClick}
                      actionName="check"
                      text="Check"/>,
        <ActionButton handleClick={this.handleClick}
                      actionName="bet"
                      text={"Bet " + this.getConstrainedBetSize()} />
      ];
    }
    return (
      <div>
        <ActionButton handleClick={this.handleClick}
                      actionName="fold"
                      text="Fold" />
        {action_buttons}
        <input type="text" value={this.state.inputBetSize} onChange={this.handleInputChange} />
      </div>
    );
  }
}

class ActionButton extends Component {
  render() {
    return (
      <button onClick={this.props.handleClick(this.props.actionName)}>
        {this.props.text}
      </button>
    )
  }
}

export default Table
