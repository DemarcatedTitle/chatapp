/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React, { Component } from "react";
import {
    BrowserRouter as Router,
    Route,
    Link,
    Redirect
} from "react-router-dom";
import PrivateRoute from "./PrivateRoute.js";
import ChatBox from "./ChatBox.js";
import LoggedIn from "./LoggedIn.js";
import Login from "./Login.js";
import NewRoom from "./NewRoom.js";
import Rooms from "./Rooms.js";
const io = require("socket.io-client");
const sockethandlers = require("./sockethandlers.js");
const roomhandler = require("./sockethandlers.js").rooms;
let socket;
class Routes extends Component {
    constructor(props) {
        super(props);
        const loggedIn = localStorage.getItem("idtoken") !== null
            ? true
            : false;
        // Temporary set Logged in as true to set it all up
        let listeners = false;
        if (loggedIn) {
            socket = io("localhost:8000", {
                query: {
                    token: localStorage.getItem("idtoken")
                }
            });
            console.log("socket = located in constructor");
        }
        this.state = {
            loggedIn: loggedIn,
            chatlogs: [],
            newRoom: false,
            rooms: [],
            currentRoom: "",
            listeners: listeners
        };
        this.logout = this.logout.bind(this);
        this.login = this.login.bind(this);
        this.joinChat = this.joinChat.bind(this);
        this.createRoom = this.createRoom.bind(this);
    }
    logout() {
        let history = this.props.history;
        window.localStorage.clear();
        socket.close();
        return this.setState({ loggedIn: false });
        // return history.push("/");
    }
    login(event, creds) {
        event.preventDefault();
        fetch("/api/auth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(creds),
            credentials: "same-origin"
        }).then(response => {
            response.json().then(data => {
                if (
                    data.idtoken !== "undefined" && data.idtoken !== undefined
                ) {
                    console.log(data.idtoken);
                    window.localStorage.setItem("idtoken", data.idtoken);
                    window.localStorage.setItem("username", data.username);
                    console.log("located in fetch socket =");
                    socket = io("localhost:8000", {
                        query: {
                            token: localStorage.getItem("idtoken")
                        }
                    });
                    socket.on(
                        "chat message",
                        sockethandlers.chatMessages.bind(this)
                    );
                    socket.on("rooms", roomhandler.bind(this));
                    socket.on("error", error => {
                        console.log(`componentDidMount Error: ${error}`);
                        socket.close();
                        return this.setState({ loggedIn: false });
                    });

                    return this.setState({ loggedIn: true });
                } else {
                    return this.setState({ wrongPass: true });
                }
            });
        });
    }
    createRoom(payload) {
        socket.emit("new room", payload);
    }
    joinChat(chatroom) {
        console.log(chatroom);
        socket.emit("join", chatroom);
        this.setState({ chatlogs: [] });
    }
    updateChatlogs(messages) {
        this.setState({ chatlogs: messages });
    }
    componentDidMount() {
        if (this.state.loggedIn) {
            socket.on("chat message", messages => {
                this.updateChatlogs(messages);
            });
            socket.on("rooms", rooms => {
                const roomObj = JSON.parse(rooms);
                if (roomObj.currentRoom) {
                    return this.setState({
                        rooms: roomObj.rooms,
                        currentRoom: roomObj.currentRoom
                    });
                } else {
                    return this.setState({ rooms: roomObj.rooms });
                }
            });
            socket.on("error", error => {
                console.log(`componentDidMount Error: ${error}`);
                socket.close();
                return this.setState({ loggedIn: false });
            });
        }
    }
    render() {
        const login = this.login;
        const roomsProps = {};
        roomsProps.rooms = this.state.rooms;
        roomsProps.joinChat = this.joinChat;
        roomsProps.currentRoom = this.state.currentRoom;
        roomsProps.createRoom = this.createRoom;
        return (
            <Router>
                <div>
                    <ul className="App-header">
                        <li>
                            this.state.loggedIn:
                            {" "}
                            {this.state.loggedIn.toString()}
                            {" "}
                        </li>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/auth">Auth</Link></li>
                        <LoggedIn
                            logout={this.logout}
                            loggedIn={this.state.loggedIn}
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
                                    wrongPass={this.state.wrongPass}
                                    loggedIn={this.state.loggedIn}
                                    login={login}
                                />
                            )}
                        />
                        <PrivateRoute
                            test={"this is a test"}
                            roomsProps={roomsProps}
                            chatlogs={this.state.chatlogs}
                            loggedIn={this.state.loggedIn}
                            socket={socket}
                            exact
                            path="/"
                            component={ChatBox}
                        />
                        <PrivateRoute
                            roomsProps={roomsProps}
                            chatlogs={this.state.chatlogs}
                            loggedIn={this.state.loggedIn}
                            socket={socket}
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
