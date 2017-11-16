import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class ChatWindow extends Component {
  constructor(props) {
    super(props);
    this.sendChat = this.sendChat.bind(this);
  }
  componentDidUpdate() {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  sendChat(event) {
    event.preventDefault();
    console.log(this.props);
    this.context.socket.emit('send chat', {table_name: this.props.tableName,
                                           message: this.input.value});
    this.input.value = '';
  }

  render() {
    return(
      <div className="chat">
        <div id="chat-window">
          {this.props.chatMessages.map((msg, idx) =>
            <div key={idx}>{msg}</div>
          )}
          <div ref={(el) => { this.lastChat = el }}></div>
        </div>
        <form onSubmit={this.sendChat}>
          <input type="text"
                 className="chat-message form-control"
                 ref={(input) => this.input = input} />
        </form>
      </div>
    );
  }
}

ChatWindow.contextTypes = {
  socket: PropTypes.object
}

const mapStateToProps = (state) => {
  return {
    chatMessages: state.table.chatMessages,
    tableName: state.table.name
  };
}

export default connect(mapStateToProps)(ChatWindow);
