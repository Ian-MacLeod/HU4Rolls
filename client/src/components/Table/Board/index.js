import React from 'react';
import PropTypes from 'prop-types';
import Card from '../Card';

const Board = ({ cards }) => (
  <ul className="board">
    {cards.map((card, index) => (
      <li key={index}>
        <Card card={card} />
      </li>
    ))}
  </ul>
);

Board.propTypes = {
  cards: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Board;
