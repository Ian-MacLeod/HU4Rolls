import React, { Component } from 'react';
import { Button } from 'react-bootstrap';

class ActionButton extends Component {
  render() {
    return (
      <Button onClick={this.props.handleClick}>
        {this.props.text}
      </Button>
    )
  }
}

export default ActionButton;
