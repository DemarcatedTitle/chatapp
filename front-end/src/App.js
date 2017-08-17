/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React, { Component } from "react";
import {
    BrowserRouter as Router,
    Route,
    Link,
    Redirect
} from "react-router-dom";

import ChatBox from "./ChatBox.js";
import LoggedIn from "./LoggedIn.js";
import Login from "./Login.js";
import logo from "./logo.svg";
import "./App.css";
const io = require("socket.io-client");
const socket = io("localhost:8000", {
    query: {
        token: localStorage.getItem("idtoken")
    }
});
function isAuthenticated() {
    if (
        localStorage.getStore("idtoken") !== "undefined" ||
        localStorage.getStore("idtoken") !== null
    ) {
        return true;
    } else {
        return false;
    }
}
let loggedIn = window.localStorage.getItem("id_token");
class BasicExample extends Component {
    constructor(props) {
        super(props);
        const loggedIn = localStorage.getItem("idtoken") !== null
            ? true
            : false;
        this.state = { loggedIn: loggedIn };
        this.logout = this.logout.bind(this);
        this.login = this.login.bind(this);
    }

    logout() {
        let history = this.props.history;
        window.localStorage.clear();
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
                if (data.idtoken !== "undefined") {
                    window.localStorage.setItem("idtoken", data.idtoken);
                    window.localStorage.setItem("username", data.username);
                    return this.setState({ loggedIn: true });
                } else {
                    console.log(
                        "That username/password combination didn't match our records"
                    );
                    return this.setState({ wrongPass: true });
                }
            });
        });
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
                    <Route
                        exact
                        path="/login"
                        render={routeProps => (
                            <Login
                                {...routeProps}
                                loggedIn={this.state.loggedIn}
                                login={login}
                            />
                        )}
                    />
                    <PrivateRoute
                        loggedIn={this.state.loggedIn}
                        socket={socket}
                        exact
                        path="/"
                        component={ChatBox}
                    />
                    <PrivateRoute
                        loggedIn={this.state.loggedIn}
                        socket={socket}
                        path="/auth"
                        component={ChatBox}
                    />
                    <PrivateRoute
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

const PrivateRoute = ({ component: Component, socket, loggedIn, ...rest }) => (
    <Route
        {...rest}
        render={props =>
            (loggedIn
                ? <Component socket={socket} {...props} />
                : <Redirect
                      to={{
                          pathname: "/login"
                      }}
                  />)}
    />
);
class App extends Component {
    handleClick(event) {}
    handleSubmit(event) {
        event.preventDefault();
    }
    render() {
        return (
            <div className="App">
                <div>
                    <BasicExample loggedIn={this.props.loggedIn} />
                </div>
            </div>
        );
    }
}

export default App;
