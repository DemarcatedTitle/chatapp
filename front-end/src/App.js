/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React, { Component } from "react";
import {
    BrowserRouter as Router,
    Route,
    Link,
    Redirect
} from "react-router-dom";
import Routes from "./Routes.js";
import LoggedIn from "./LoggedIn.js";
import logo from "./logo.svg";
import "./App.css";
const io = require("socket.io-client");
let socket;
class App extends Component {
    handleClick(event) {}
    handleSubmit(event) {
        event.preventDefault();
    }
    render() {
        return (
            <div className="App">
                <div>
                    <Routes loggedIn={this.props.loggedIn} />
                </div>
            </div>
        );
    }
}

export default App;
