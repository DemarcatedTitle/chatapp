/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React, { Component } from "react";
class NewRoom extends Component {
    constructor(props) {
        super(props);
        this.state = { newRoom: false };
        this.addRoom = this.addRoom.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(event) {
        const fieldName = event.target.type;
        this.setState({ room: event.target.value });
    }
    addRoom(event) {
        event.preventDefault();

        if (this.state.newRoom === true) {
            this.props.createRoom(this.state.room);
        }
        this.setState({ newRoom: !this.state.newRoom });
    }
    render() {
        if (this.state.newRoom === false) {
            return (
                <p className="" onClick={this.addRoom}>
                    + New Room
                </p>
            );
        } else {
            return (
                <form onChange={this.handleChange} onSubmit={this.addRoom}>
                    <input /><button>Add</button>
                </form>
            );
        }
    }
}
export default NewRoom;
