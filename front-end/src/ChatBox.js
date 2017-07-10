/* eslint-disable no-console */
import React from "react";
import moment from "moment";
const io = require("socket.io-client");
const socket = io("localhost:4000");
class ChatBox extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = { message: "", chatlogs: [] };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        socket.on("chat message", messages => {
            this.updateChatlogs(messages);
        });
    }
    updateChatlogs(messages) {
        this.setState({ chatlogs: messages });
    }
    handleSubmit(event) {
        event.preventDefault();
        socket.emit("chat message", this.state.message);
        this.setState({ message: "" });
        document.getElementById("endOfMessages").scrollIntoView();
    }
    handleChange(event) {
        this.setState({ message: event.target.value });
    }
    componentDidUpdate() {
        document.getElementById("endOfMessages").scrollIntoView();
    }
    componentDidMount() {
        // window.addEventListener("keydown", this.handleKeyPress);
    }
    componentWillUnmount() {
        // window.removeEventListener("keydown", this.handleKeyPress);
    }
    render() {
        let chatlogs = this.state.chatlogs.map(function(message, index) {
            return (
                <li key={index}>
                    <div className="messageData">
                        <p>
                            {moment(message.date).format("MM/DD/YY hh:mm:ss a")}
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