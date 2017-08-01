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
import Login from "./Login.js";
import logo from "./logo.svg";
import "./App.css";
const io = require("socket.io-client");
const socket = io("localhost:4000");

let loggedIn = window.localStorage.getItem("id_token");
// onClick={window.localStorage.clear()}
const LoggedIn = () => {
    return loggedIn
        ? <li>
              <button
                  onClick={function() {
                      loggedIn = false;
                      myAuth.isAuthenticated = false;
                      window.localStorage.clear();
                      return <Redirect push to="/login" />;
                  }}
              >
                  Sign out of {loggedIn}
              </button>
          </li>
        : <li><Link to="/login">Log in</Link></li>;
};

// <li><Link to="/login">Log in</Link></li>
const BasicExample = () => (
    <Router>
        <div>
            <ul className="App-header">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/auth">Auth</Link></li>
                <LoggedIn />
            </ul>

            <hr />
            <Route exact path="/login" component={Login} />
            <PrivateRoute exact path="/" component={ChatBox} />
            <PrivateRoute path="/auth" component={ChatBox} />
            <PrivateRoute path="localhost:3000/" component={ChatBox} />
        </div>
    </Router>
);
let myAuth = { isAuthenticated: false };
if (loggedIn) {
    myAuth.isAuthenticated = true;
}

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route
        {...rest}
        render={props =>
            (myAuth.isAuthenticated
                ? <Component {...props} />
                : <Redirect
                      to={{
                          pathname: "/login"
                      }}
                  />)}
    />
);

// <Route exact path="/" component={ChatBox} />
class App extends Component {
    handleClick(event) {
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
                <div>
                    <BasicExample />
                </div>
            </div>
        );
    }
}

export default App;
