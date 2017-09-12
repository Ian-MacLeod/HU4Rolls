import React, { Component } from 'react';

class ChatWindow extends Component {
  constructor() {
    super();
    this.state = {messages: [],
                  messageInput: ''};
    this.sendMessage = this.sendMessage.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.props.socket.on('chat message', msg =>{
      this.setState({
        messages: this.state.messages.concat([msg])
      });
    });
  }

  componentDidUpdate() {
    let chatWindow = document.getElementById('chat-window');
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  sendMessage(event) {
    this.props.socket.emit('send chat', {table_name: this.props.tableName,
                                         message: this.state.messageInput});
    this.setState({messageInput: ''});
    event.preventDefault();
  }

  handleChange(event) {
    this.setState({messageInput: event.target.value});
  }

  render() {
    return(
      <div className="chat">
        <div id="chat-window">
          {this.state.messages.map((msg, idx) =>
            <div key={idx}>{msg}</div>
          )}
          <div ref={(el) => { this.lastChat = el }}></div>
        </div>
        <form onSubmit={this.sendMessage}>
          <input type="text" className="chat-message form-control" value={this.state.messageInput} onChange={this.handleChange} />
        </form>
      </div>
    );
  }
}

export default ChatWindow;
