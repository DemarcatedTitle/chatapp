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
const io = require("socket.io-client");
let socket;
class Routes extends Component {
    constructor(props) {
        super(props);
        const loggedIn = localStorage.getItem("idtoken") !== null
            ? true
            : false;
        // Temporary set Logged in as true to set it all up
        this.state = {
            loggedIn: loggedIn,
            chatlogs: [],
            newRoom: false
        };
        this.logout = this.logout.bind(this);
        this.login = this.login.bind(this);
        this.joinChat = this.joinChat.bind(this);
        this.addRoom = this.addRoom.bind(this);
        if (loggedIn) {
            socket = io("localhost:8000", {
                query: {
                    token: localStorage.getItem("idtoken")
                }
            });
        }
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
                    socket = io("localhost:8000", {
                        query: {
                            token: localStorage.getItem("idtoken")
                        }
                    });
                    socket.on("chat message", messages => {
                        console.log("fetch emitter");
                        console.log(socket.listeners("chat message"));
                        this.updateChatlogs(messages);
                    });
                    socket.on("error", error => {
                        console.log(`Error: ${error}`);
                        window.localStorage.clear();
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
    joinChat(chat) {}
    addRoom(event) {
        event.preventDefault();

        this.setState({ newRoom: !this.state.newRoom });
    }
    updateChatlogs(messages) {
        this.setState({ chatlogs: messages });
    }
    componentDidMount() {
        if (this.state.loggedIn) {
            socket.on("chat message", messages => {
                console.log("componentdidmount emitter");
                console.log(socket.listeners("chat message"));
                this.updateChatlogs(messages);
            });
            socket.on("error", error => {
                console.log(`componentDidMount Error: ${error}`);
                return this.setState({ loggedIn: false });
            });
        }
    }

    render() {
        const login = this.login;
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
                    <div className="rooms">
                        <ul>
                            <li onClick={this.joinChat("coding-101")}>
                                <p className="in">Coding-101</p>
                            </li>
                            <li>
                                <p
                                    className="active"
                                    onClick={this.joinChat("coding-101")}
                                >
                                    Random
                                </p>
                            </li>
                            <li>
                                {this.state.newRoom === false
                                    ? <p className="" onClick={this.addRoom}>
                                          + New Room
                                      </p>
                                    : <form onSubmit={this.addRoom}>
                                          <input /><button>Add</button>
                                      </form>}
                            </li>
                        </ul>
                    </div>
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
                        chatlogs={this.state.chatlogs}
                        loggedIn={this.state.loggedIn}
                        socket={socket}
                        exact
                        path="/"
                        component={ChatBox}
                    />
                    <PrivateRoute
                        chatlogs={this.state.chatlogs}
                        loggedIn={this.state.loggedIn}
                        socket={socket}
                        path="/auth"
                        component={ChatBox}
                    />
                    <PrivateRoute
                        chatlogs={this.state.chatlogs}
                        loggedIn={this.state.loggedIn}
                        socket={socket}
                        path="localhost:3000/"
                        component={ChatBox}
                    />
                </div>
            </Router>
        );
    }
}
export default Routes;
