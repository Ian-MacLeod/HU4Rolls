import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Card from '../Card';
import Timer from './Timer';

class Seat extends Component {
  constructor(props) {
    super(props);
    this.handleSit = this.handleSit.bind(this);
  }

  handleSit() {
    this.context.socket.emit('take seat', {
      table_name: this.props.tableName,
      num: this.props.seatNum,
    });
  }

  render() {
    let contents;
    if (this.props.seatInfo.isEmpty) {
      contents = (
        <button onClick={this.handleSit}>Sit Here</button>
      );
    } else {
      contents = (
        <div>
          <div className="stack">
            {`Stack: ${this.props.seatInfo.stackSize}`}
          </div>
          <div className="net">
            {`Net: ${this.props.seatInfo.netWon}`}
          </div>
          <Timer isActive={this.props.isActive} />
        </div>
      );
    }
    let button = '';
    if (this.props.isButton) {
      button = <div className="dealer-button">D</div>;
    }
    return (
      <div className={`seat seat-${this.props.seatNum} ${this.props.isActive && ' active'}`}>
        {this.props.cards[0] &&
          <Card card={this.props.cards[0]} />
        }
        {this.props.cards[1] &&
          <Card card={this.props.cards[1]} />
        }
        {button}
        <div className="invested">
          {this.props.seatInfo.amountInvested || ''}
        </div>
        {contents}
      </div>
    );
  }
}

Seat.propTypes = {
  seatInfo: PropTypes.shape({
    isEmpty: PropTypes.bool,
    stackSize: PropTypes.number,
    netWon: PropTypes.number,
    amountInvested: PropTypes.number,
  }).isRequired,
  seatNum: PropTypes.number.isRequired,
  cards: PropTypes.arrayOf(PropTypes.string).isRequired,
  isActive: PropTypes.bool.isRequired,
  isButton: PropTypes.bool.isRequired,
  tableName: PropTypes.string.isRequired,
};

Seat.contextTypes = {
  socket: PropTypes.object,
};

export default Seat;
