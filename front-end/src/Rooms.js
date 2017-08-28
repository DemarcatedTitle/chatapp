/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import React, { Component } from "react";
import NewRoom from "./NewRoom.js";
class Rooms extends Component {
    constructor(props) {
        super(props);
        this.clickChat = this.clickChat.bind(this);
    }
    clickChat(event) {
        this.props.joinChat(event.target.textContent);
    }
    render() {
        let roomArray = this.props.rooms.map((room, index) => {
            const active = room === this.props.currentRoom ? "active" : "";
            return (
                <li key={index} onClick={this.clickChat}>
                    <p className={active}>{room}</p>
                </li>
            );
        });
        return (
            <div className="rooms">
                <ul>
                    {roomArray}
                    <li>
                        <NewRoom createRoom={this.props.createRoom} />
                    </li>
                </ul>
            </div>
        );
    }
}
export default Rooms;
