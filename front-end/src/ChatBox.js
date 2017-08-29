/* eslint-disable no-console */
import React from "react";
import Rooms from "./Rooms.js";
import moment from "moment";
class ChatBox extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = { message: "", chatlogs: [] };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
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
            <div className="columnContainer">
                <Rooms roomsProps={this.props.roomsProps} />
                <div className="rowContainer">
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
                    <div className="users">
                        <ul>
                            <li>
                                <p>DarthVader</p>
                            </li>
                            <li>
                                <p>JarJar</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}
export default ChatBox;
