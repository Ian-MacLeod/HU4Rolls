import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ card }) => {
  let suit = 'unknown';
  let rank = '';
  if (card !== 'unknown') {
    [rank, suit] = card;
  }
  return (
    <div className={`card suit-${suit}`}>
      <div>{rank}</div>
    </div>
  );
};

Card.propTypes = {
  card: PropTypes.string.isRequired,
};

export default Card;
