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
    }
    handleChange(event) {
        const fieldName = event.target.type;
        this.setState({ [event.target.name]: event.target.value });
    }
    handleClick(event) {
        console.log(
            `idtoken: ${JSON.stringify(window.localStorage.getItem("idtoken"))}`
        );
    }
    handleSubmit(event) {
        event.preventDefault();
        fetch("/api/auth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(this.state),
            credentials: "same-origin"
        }).then(response => {
            response.json().then(data => {
                if (data.idtoken !== "undefined") {
                    window.localStorage.setItem("idtoken", data.idtoken);
                    window.localStorage.setItem("username", data.username);
                    return this.setState({ redirectToReferrer: true });
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
        const wrongPass = this.state.wrongPass;
        const { from } = this.props.location.state || {
            from: { pathname: "/" }
        };
        if (this.state.redirectToReferrer) {
            return <Redirect to={{ pathname: "/auth" }} />;
        } else {
            return (
                <div>
                    <form
                        onSubmit={this.props.login}
                        className="login"
                        action=""
                    >
                        <div>
                            <label htmlFor="username">Username</label>
                            <input
                                name="username"
                                onChange={this.handleChange}
                                type="username"
                            />
                            <label htmlFor="password">Password</label>
                            <input
                                name="password"
                                onChange={this.handleChange}
                                type="password"
                            />
                            <button>Login</button>
                        </div>
                    </form>
                    {wrongPass
                        ? <p className="validationErr">
                              "That username/password combination didn't match our records"
                          </p>
                        : ""}
                    <button onClick={this.handleClick}>
                        Log Storage
                    </button>
                </div>
            );
        }
    }
}
export default Login;
