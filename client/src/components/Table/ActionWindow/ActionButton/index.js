import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const ActionButton = ({ handleClick, text }) => (
  <Button onClick={handleClick}>
    {text}
  </Button>
);

ActionButton.propTypes = {
  handleClick: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
};

export default ActionButton;
