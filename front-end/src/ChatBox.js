/* eslint-disable no-console */
import React from "react";
import moment from "moment";
// const io = require("socket.io-client");
// const socket = io("localhost:8000", {
//     query: {
//         token: localStorage.getItem("idtoken")
//     }
// });
class ChatBox extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = { message: "", chatlogs: [] };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    updateChatlogs(messages) {
        this.setState({ chatlogs: messages });
    }
    handleSubmit(event) {
        event.preventDefault();
        this.props.socket.emit("chat message", this.state.message);
        this.setState({ message: "" });
        document.getElementById("endOfMessages").scrollIntoView();
    }
    handleChange(event) {
        this.setState({ message: event.target.value });
    }
    componentDidUpdate() {
        document.getElementById("endOfMessages").scrollIntoView();
    }
    componentWillUnmount() {}
    render() {
        let chatlogs = this.props.chatlogs.map(function(message, index) {
            return (
                <li key={index}>
                    <div className="messageData">
                        <p>
                            {moment(message.date).format("MM/DD/YY hh:mm a")}
                        </p>
                        {" "}
                        <p className="username">
                            {message.username}
                        </p>
                        <p />
                    </div>
                    {" "}
                    <div className="message"><p>{message.message}</p></div>
                </li>
            );
        });
        return (
            <div className="chatBox">
                <ul id="messages">
                    {chatlogs}
                    <li id="endOfMessages"> End of messages </li>
                </ul>
                <form onSubmit={this.handleSubmit}>
                    <input
                        autoComplete="off"
                        value={this.state.message}
                        onChange={this.handleChange}
                        type="text"
                        id="m"
                    />
                    <button onClick={this.handleClick}>Send</button>
                </form>
            </div>
        );
    }
}
export default ChatBox;
