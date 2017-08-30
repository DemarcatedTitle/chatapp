/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import React from "react";
import Rooms from "./Rooms.js";
import Users from "./Users.js";
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
        // currentroom gets set before chat logs
        let displayedRoom = "";
        if (
            this.props.chatlogs.get(this.props.roomsProps.currentRoom) ===
            undefined
        ) {
            displayedRoom = "";
        } else {
            displayedRoom = this.props.roomsProps.currentRoom;
        }
        let chatlogs = this.props.chatlogs
            .get(displayedRoom)
            .map(function(message, index) {
                return (
                    <li key={index}>
                        <div className="messageData">
                            <p>
                                {moment(message.date).format(
                                    "MM/DD/YY hh:mm a"
                                )}
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
                    <Users usersProps={this.props.usersProps} />
                </div>
            </div>
        );
    }
}
export default ChatBox;
