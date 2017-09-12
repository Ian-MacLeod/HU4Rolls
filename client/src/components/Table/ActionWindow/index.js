import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import ActionButton from './ActionButton';

class ActionWindow extends Component {
  constructor() {
    super();
    this.state = {inputBetSize: 0};
    this.handleInputChange = this.handleInputChange.bind(this);
    this.submitAction = this.submitAction.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.setBetToPotRatio = this.setBetToPotRatio.bind(this);
  }

  submitAction(action) {
    return (function() {
      console.log(this.getConstrainedBetSize(), this.props.totalBetSize, this.props.betSize);
      this.props.socket.emit('do action',
                             {table_name: this.props.tableName,
                              'name': action,
                              'size': this.getConstrainedBetSize() - this.props.totalBetSize + this.props.betSize});
      this.setState({inputBetSize: 0});
    }).bind(this);
  }

  handleInputChange(event) {
    this.setState({inputBetSize: event.target.value});
  }

  handleKeyDown(action) {
    return (function(event) {
      if (event.key === 'Enter'){
        this.submitAction(action)();
      }
    }).bind(this);
  }

  getConstrainedBetSize(){
    let betSize = parseInt(this.state.inputBetSize) || 0;
    return this.constrainBetSize(betSize);
  }

  constrainBetSize(betSize){
    betSize = parseInt(betSize);
    let minBetSize = this.props.totalBetSize + Math.max(this.props.betSize, this.props.BBSize);
    let maxBetSize = this.props.heroStackSize + this.props.totalBetSize - this.props.betSize;
    betSize = Math.max(minBetSize, betSize);
    betSize = Math.min(maxBetSize, betSize);
    return betSize;
  }

  setBetToPotRatio(ratio){
    return function(){
      let potSizeBet = (this.props.amountInvested + this.props.betSize
                        + ratio * (this.props.potSize + this.props.betSize));
      this.setState({inputBetSize: this.constrainBetSize(potSizeBet)});
    }.bind(this)
  }

  render() {
    let aggressive_action, aggressive_text, passive_action, passive_text;
    if (this.props.betSize){
      aggressive_action = "raise";
      aggressive_text = "Raise " + this.getConstrainedBetSize();
      passive_action = "call";
      passive_text = "Call " + this.props.betSize;
    } else {
      aggressive_action = "bet";
      if (this.props.isFacingLimp){
        aggressive_text = "Raise " + this.getConstrainedBetSize();
      } else {
        aggressive_text = "Bet " + this.getConstrainedBetSize();
      }
      passive_action = "check";
      passive_text = "Check";
    }
    let aggressive_buttons = '';
    if (this.props.heroStackSize > this.props.betSize){
      aggressive_buttons = [
        <ActionButton key="bet-button"
                      handleClick={this.submitAction(aggressive_action)}
                      text={aggressive_text} />,
        <div key="bet-size-buttons" className="bet-size-buttons">
          <Button onClick={this.setBetToPotRatio(1)}>Pot</Button>
          <Button onClick={this.setBetToPotRatio(3/4)}>3/4 Pot</Button>
          <Button onClick={this.setBetToPotRatio(1/2)}>1/2 Pot</Button>
        </div>,
        <input key="bet-input"
               type="text"
               value={this.state.inputBetSize}
               onChange={this.handleInputChange}
               onKeyDown={this.handleKeyDown(aggressive_action)}/>
      ];
    }
    return (
      <div className="action-window">
        <ActionButton handleClick={this.submitAction("fold")} text="Fold" />
        <ActionButton handleClick={this.submitAction(passive_action)} text={passive_text} />
        {aggressive_buttons}
      </div>
    );
  }
}

export default ActionWindow;
