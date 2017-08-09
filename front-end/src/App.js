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
const BasicExample = () => (
    <Router>
        <div>
            <ul className="App-header">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/auth">Auth</Link></li>
                <LoggedIn loggedIn={window.localStorage.getItem("username")} />
            </ul>

            <hr />
            <Route exact path="/login" component={Login} />
            <PrivateRoute
                loggedIn={localStorage.getItem("idtoken") !== null}
                exact
                path="/"
                component={ChatBox}
            />
            <PrivateRoute
                loggedIn={localStorage.getItem("idtoken") !== null}
                path="/auth"
                component={ChatBox}
            />
            <PrivateRoute
                loggedIn={localStorage.getItem("idtoken") !== null}
                path="localhost:3000/"
                component={ChatBox}
            />
        </div>
    </Router>
);
let myAuth = { isAuthenticated: false };
if (loggedIn) {
    myAuth.isAuthenticated = true;
}
// function isAuthenticated() {
//     fetch("/api/auth/jwt", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify(localStorage.getItem("idtoken")),
//         credentials: "same-origin"
//     }).then(response => {
//         response.json().then(data => {
//             return data.authenticated;
//         });
//     });
// }

const PrivateRoute = ({ component: Component, loggedIn, ...rest }) => (
    <Route
        {...rest}
        render={props =>
            (loggedIn === true
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
        // socket.emit("chat message", "A message was submitted");
    }
    handleSubmit(event) {
        event.preventDefault();
        // socket.emit("chat message", "A message was submitted");
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
