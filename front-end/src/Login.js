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
        this.state = { username: "", password: "" };
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
        console.log("form submitted");
        fetch("/api/auth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(this.state),
            credentials: "same-origin"
        }).then(function(response) {
            response.json().then(function(data) {
                window.localStorage.setItem("id_token", data.username);
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
                <button onClick={this.handleClick}>
                    Log Storage
                </button>
            </div>
        );
    }
}
export default Login;
