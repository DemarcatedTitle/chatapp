import React, { Component } from "react";
import ChatBox from "./ChatBox.js";
import logo from "./logo.svg";
import "./App.css";
const io = require("socket.io-client");
const socket = io("localhost:4000");
class App extends Component {
    handleClick(event) {
        console.log("Clicked");
        // socket.emit("chat message", this.input.value);
        socket.emit("chat message", "A message was submitted");
    }
    handleSubmit(event) {
        event.preventDefault();
        socket.emit("chat message", "A message was submitted");
    }
    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h2>Welcome to React</h2>
                </div>
                <ChatBox />
                <code>src/App.js</code>
            </div>
        );
    }
}

export default App;
