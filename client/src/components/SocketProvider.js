import { Component } from 'react';
import PropTypes from 'prop-types';

class SocketProvider extends Component {
  getChildContext() {
    return {
      socket: this.props.socket,
    };
  }

  render() {
    return this.props.children;
  }
}

SocketProvider.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  socket: PropTypes.object.isRequired,
  children: PropTypes.element.isRequired,
};

SocketProvider.childContextTypes = {
  socket: PropTypes.object,
};

export default SocketProvider;
