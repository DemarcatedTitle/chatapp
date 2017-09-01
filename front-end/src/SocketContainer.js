/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import React, { Component } from "react";
import Routes from "./Routes.js";
const io = require("socket.io-client");
const sockethandlers = require("./sockethandlers.js");
const roomhandler = require("./sockethandlers.js").rooms;
let socket;

class SocketContainer extends Component {
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
            chatlogs: new Map([["", []]]),
            newRoom: false,
            rooms: [],
            currentRoom: "",
            listeners: listeners,
            users: [],
            currentUser: ""
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
                    window.localStorage.setItem("idtoken", data.idtoken);
                    window.localStorage.setItem("username", data.username);
                    console.log("located in fetch socket =");
                    socket = io("localhost:8000", {
                        query: {
                            token: localStorage.getItem("idtoken")
                        }
                    });
                    socket.on("users", sockethandlers.users.bind(this));
                    socket.on("userJoined", user => {
                        console.log(user);
                        if (!this.state.users.includes(user)) {
                            this.setState({
                                users: this.state.users.concat(user)
                            });
                        }
                    });
                    socket.on("userLeft", user => {
                        // this.setstate remove user
                        console.log("userLeft");
                        this.setState({
                            users: this.state.users.filter(
                                oldUser => oldUser !== user
                            )
                        });
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
        let tempLog = this.state.chatlogs;
        this.setState({ chatlogs: tempLog.set(chatroom, []) });
        socket.emit("join", chatroom);
    }
    updateChatlogs(messages) {
        const messagesObj = JSON.parse(messages);
        let tempLog = this.state.chatlogs;
        tempLog.set(messagesObj.room, messagesObj.logs);
        this.setState({ chatlogs: tempLog });
    }
    componentDidMount() {
        if (this.state.loggedIn) {
            socket.on("users", sockethandlers.users.bind(this));
            socket.on("userJoined", user => {
                console.log(user);
                if (!this.state.users.includes(user)) {
                    this.setState({
                        users: this.state.users.concat(user)
                    });
                }
            });
            socket.on("userLeft", user => {
                // this.setstate remove user
                console.log("userLeft");
                this.setState({
                    users: this.state.users.filter(oldUser => oldUser !== user)
                });
            });
            socket.on("chat message", sockethandlers.chatMessages.bind(this));
            socket.on("rooms", roomhandler.bind(this));
            socket.on("error", error => {
                console.log(`componentDidMount Error: ${error}`);
                socket.close();
                return this.setState({ loggedIn: false });
            });
        }
    }
    render() {
        const login = this.login;
        const roomsProps = {
            rooms: this.state.rooms,
            joinChat: this.joinChat,
            currentRoom: this.state.currentRoom,
            createRoom: this.createRoom
        };
        const usersProps = {
            users: this.state.users,
            currentUser: this.state.currentUser
        };
        return (
            <Routes
                loggedIn={this.state.loggedIn}
                logout={this.logout}
                wrongPass={this.state.wrongPass}
                login={this.login}
                roomsProps={roomsProps}
                usersProps={usersProps}
                chatlogs={this.state.chatlogs}
                socket={socket}
            />
        );
    }
}
export default SocketContainer;
