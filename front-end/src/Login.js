/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

import React from "react";
import { Redirect } from "react-router-dom";

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
}

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = { username: "", password: "", redirectToReferrer: false };
        this.handleChange = this.handleChange.bind(this);
        this.login = this.props.login.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleChange(event) {
        const fieldName = event.target.type;
        this.setState({ [event.target.name]: event.target.value });
    }
    handleSubmit(event) {
        event.preventDefault();
        const creds = {
            username: this.state.username,
            password: this.state.password
        };
        this.props.login(event, creds);
    }
    handleClick(event) {
        // console.log(
        //     `idtoken: ${JSON.stringify(window.localStorage.getItem("idtoken"))}`
        // );
        event.preventDefault();
        fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: this.state.username,
                password: this.state.password
            }),
            credentials: "same-origin"
        }).then(response => {
            response.json().then(data => {
                if (data.text === "success") {
                    this.setState({ registered: true });
                } else {
                    this.setState({ error: data.message });
                }
            });
        });
    }
    render() {
        let creds = {
            username: this.state.username,
            password: this.state.password
        };
        const { from } = this.props.location.state || {
            from: { pathname: "/" }
        };
        if (this.props.loggedIn) {
            return <Redirect to={{ pathname: "/auth" }} />;
        } else {
            return (
                <div>
                    <div className="loginContainer">
                        <form
                            onSubmit={this.handleSubmit}
                            className="login"
                            action=""
                        >
                            <div>
                                <label htmlFor="username">Username</label>
                                <input
                                    autoComplete="off"
                                    name="username"
                                    onChange={this.handleChange}
                                    type="username"
                                />
                                <label htmlFor="password">Password</label>
                                <input
                                    autoComplete="off"
                                    name="password"
                                    onChange={this.handleChange}
                                    type="password"
                                />
                                <button>Login</button>
                                {this.state.error
                                    ? <p className="">
                                          {this.state.error}
                                      </p>
                                    : ""}
                                {this.state.registered
                                    ? <p className="">
                                          You are now registered, try logging in.
                                      </p>
                                    : ""}
                                <button onClick={this.handleClick}>
                                    Register
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        }
    }
}
export default Login;
