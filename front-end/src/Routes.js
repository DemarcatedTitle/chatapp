/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React, { Component } from "react";
import {
    BrowserRouter as Router,
    Route,
    Link,
    Redirect
} from "react-router-dom";
import SocketContainer from "./SocketContainer.js";
import PrivateRoute from "./PrivateRoute.js";
import ChatBox from "./ChatBox.js";
import LoggedIn from "./LoggedIn.js";
import Login from "./Login.js";
import NewRoom from "./NewRoom.js";
import Rooms from "./Rooms.js";
const io = require("socket.io-client");
const sockethandlers = require("./sockethandlers.js");
const roomhandler = require("./sockethandlers.js").rooms;
// let socket;

class Routes extends Component {
    constructor(props) {
        super(props);
    }
    updateChatlogs(messages) {
        const messagesObj = JSON.parse(messages);
        let tempLog = this.state.chatlogs;
        tempLog.set(messagesObj.room, messagesObj.logs);
        this.setState({ chatlogs: tempLog });
    }
    render() {
        return (
            <Router>
                <div>
                    <ul className="App-header">
                        <li>
                            this.props.loggedIn:
                            {" "}
                            {this.props.loggedIn.toString()}
                            {" "}
                        </li>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/auth">Auth</Link></li>
                        <LoggedIn
                            logout={this.props.logout}
                            loggedIn={this.props.loggedIn}
                        />
                    </ul>

                    <hr />
                    <div>
                        <Route
                            exact
                            path="/login"
                            render={routeProps => (
                                <Login
                                    {...routeProps}
                                    wrongPass={this.props.wrongPass}
                                    loggedIn={this.props.loggedIn}
                                    login={this.props.login}
                                />
                            )}
                        />
                        <PrivateRoute
                            test={"this is a test"}
                            roomsProps={this.props.roomsProps}
                            usersProps={this.props.usersProps}
                            chatlogs={this.props.chatlogs}
                            loggedIn={this.props.loggedIn}
                            socket={this.props.socket}
                            exact
                            path="/"
                            component={ChatBox}
                        />
                        <PrivateRoute
                            roomsProps={this.props.roomsProps}
                            usersProps={this.props.usersProps}
                            chatlogs={this.props.chatlogs}
                            loggedIn={this.props.loggedIn}
                            socket={this.props.socket}
                            path="/auth"
                            component={ChatBox}
                        />
                    </div>
                </div>
            </Router>
        );
    }
}
export default Routes;
