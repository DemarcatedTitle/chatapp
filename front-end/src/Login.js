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
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }
    handleChange(event) {
        const fieldName = event.target.type;
        this.setState({ [event.target.name]: event.target.value });
    }
    handleClick(event) {
        console.log(JSON.stringify(window.localStorage.getItem("id_token")));
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
        const { from } = this.props.location.state || {
            from: { pathname: "/" }
        };
        const { redirectToReferrer } = this.state;
        if (redirectToReferrer) {
            return <Redirect to={from} />;
        }
        // fetch("/noauth").then(function(response) {
        //     console.log(response);
        // });
        const wrongPass = this.state.wrongPass;
        return (
            <div>
                <form onSubmit={this.handleSubmit} className="login" action="">
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
export default Login;
