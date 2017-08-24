import React, { Component } from 'react';
import Card from '../Card';
import Timer from './Timer';

class Seat extends Component {
  constructor() {
    super();
    this.handleSit = this.handleSit.bind(this);
  }

  handleSit() {
    console.log(this.props.tableName)
    this.props.socket.emit('take seat', {table_name: this.props.tableName,
                                         num: this.props.seatNum});
    console.log('sitting at seat ' + this.props.seatNum);
  }

  render() {
    console.log('cards: ' + this.props.cards);
    let contents;
    if (this.props.seatInfo.isEmpty){
      contents = (
        <button onClick={this.handleSit}>Sit Here</button>
      );
    } else {
      contents = (
        <div>
          <div className="stack">
            Stack:
            {' ' + this.props.seatInfo.stackSize}
          </div>
          <div className="net">
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
      <div className={"seat seat-" + this.props.seatNum + (this.props.isActive ? " active" : "")}>
        <Card card={this.props.cards[0]} />
        <Card card={this.props.cards[1]} />
        {button}
        <div className="invested">
          {this.props.seatInfo.amountInvested || ''}
        </div>
        {contents}
        <Timer isActive={this.props.isActive} />
      </div>
    );
  }
}

export default Seat;
