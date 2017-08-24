import React, { Component } from 'react';

class Timer extends Component {
  constructor(){
    super();
    this.state = {timeRemaining: 0};
  }

  componentWillReceiveProps(nextProps) { //Fragile, when does this get called?
    clearInterval(this.timerId);
    if (nextProps.isActive) {
      this.setState({timeRemaining: 30}); // Change later
      this.timerId = setInterval(
        () => this.tick(),
        1000
      );
    }
  }

  componentWillUnmount() {
    clearInterval(this.timerId);
  }

  tick() {
    this.setState({timeRemaining: this.state.timeRemaining - 1});
  }

  render() {
    return (
      <div className="timer">{this.props.isActive && this.state.timeRemaining}</div>
    );
  }
}

export default Timer
