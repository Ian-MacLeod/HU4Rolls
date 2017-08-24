import React, { Component } from 'react';

class Card extends Component {
  render() {
    let suit = 'n';
    let rank = ''
    if (this.props.card) {
      suit = this.props.card[1];
      rank = this.props.card[0];
    }
    return (
      <div className={"card suit-" + suit}>
        <div>{rank}</div>
      </div>
    );
  }
}

export default Card;
