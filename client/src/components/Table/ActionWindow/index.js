import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import ActionButton from './ActionButton';

class ActionWindow extends Component {
  constructor() {
    super();
    this.state = { inputBetSize: 0 };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.submitAction = this.submitAction.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.setBetToPotRatio = this.setBetToPotRatio.bind(this);
  }

  getConstrainedBetSize() {
    const betSize = parseInt(this.state.inputBetSize, 10) || 0;
    return this.constrainBetSize(betSize);
  }

  setBetToPotRatio(ratio) {
    return () => {
      const potSizeBet = (this.props.amountInvested + this.props.betSize
                        + ratio * (this.props.potSize + this.props.betSize));
      this.setState({ inputBetSize: this.constrainBetSize(potSizeBet) });
    };
  }

  constrainBetSize(betSize) {
    let constrainedBetSize = parseInt(betSize, 10);
    const minBetSize = this.props.totalBetSize + Math.max(this.props.betSize, this.props.BBSize);
    const maxBetSize = this.props.heroStackSize + this.props.totalBetSize - this.props.betSize;
    constrainedBetSize = Math.max(minBetSize, constrainedBetSize);
    constrainedBetSize = Math.min(maxBetSize, constrainedBetSize);
    return constrainedBetSize;
  }

  handleKeyDown(action) {
    return (event) => {
      if (event.key === 'Enter') {
        this.submitAction(action)();
      }
    };
  }

  handleInputChange(event) {
    this.setState({ inputBetSize: event.target.value });
  }

  submitAction(action) {
    return () => {
      this.context.socket.emit(
        'do action',
        {
          table_name: this.props.tableName,
          name: action,
          size: this.getConstrainedBetSize() - this.props.totalBetSize + this.props.betSize,
        },
      );
      this.setState({ inputBetSize: 0 });
    };
  }

  render() {
    let aggressiveAction;
    let aggresiveText;
    let passiveAction;
    let passiveText;
    if (this.props.betSize) {
      aggressiveAction = 'raise';
      aggresiveText = `Raise ${this.getConstrainedBetSize()}`;
      passiveAction = 'call';
      passiveText = `Call ${this.props.betSize}`;
    } else {
      aggressiveAction = 'bet';
      if (this.props.isFacingLimp) {
        aggresiveText = `Raise ${this.getConstrainedBetSize()}`;
      } else {
        aggresiveText = `Bet ${this.getConstrainedBetSize()}`;
      }
      passiveAction = 'check';
      passiveText = 'Check';
    }
    let aggresiveButton = '';
    let potSizeButtons = '';
    if (this.props.heroStackSize > this.props.betSize) {
      aggresiveButton = (
        <ActionButton
          key="bet-button"
          handleClick={this.submitAction(aggressiveAction)}
          text={aggresiveText}
        />
      );
      potSizeButtons = [
        <div
          key="bet-size-buttons"
          className="bet-size-buttons btn-group"
          role="group"
          aria-label="Pot Sizing Buttons"
        >
          <Button onClick={this.setBetToPotRatio(1)}>Pot</Button>
          <Button onClick={this.setBetToPotRatio(3 / 4)}>3/4 Pot</Button>
          <Button onClick={this.setBetToPotRatio(1 / 2)}>1/2 Pot</Button>
        </div>,
        <input
          key="bet-input"
          className="form-control"
          type="text"
          value={this.state.inputBetSize}
          onChange={this.handleInputChange}
          onKeyDown={this.handleKeyDown(aggressiveAction)}
        />,
      ];
    }
    return (
      <div className="action-window">
        <div className="btn-group" role="group" aria-label="Actions">
          <ActionButton handleClick={this.submitAction('fold')} text="Fold" />
          <ActionButton handleClick={this.submitAction(passiveAction)} text={passiveText} />
          {aggresiveButton}
        </div>
        {potSizeButtons}
      </div>
    );
  }
}

ActionWindow.propTypes = {
  heroStackSize: PropTypes.number.isRequired,
  betSize: PropTypes.number.isRequired,
  potSize: PropTypes.number.isRequired,
  totalBetSize: PropTypes.number.isRequired,
  BBSize: PropTypes.number.isRequired,
  isFacingLimp: PropTypes.bool.isRequired,
  amountInvested: PropTypes.number.isRequired,
  tableName: PropTypes.string.isRequired,
};

ActionWindow.contextTypes = {
  socket: PropTypes.object,
};

export default ActionWindow;
