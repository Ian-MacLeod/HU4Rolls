import { Component } from 'react';
import PropTypes from 'prop-types';

class SocketProvider extends Component {
    getChildContext() {
        return {
            socket: this.props.socket
        };
    }

    render() {
        return this.props.children;
    }
}

SocketProvider.childContextTypes = {
    socket: PropTypes.object
}

export default SocketProvider;
