import React, { Component } from 'react';
import Card from '../Card';

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

export default Board;
