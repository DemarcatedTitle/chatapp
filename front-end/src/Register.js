/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

import React from "react";
import { Redirect } from "react-router-dom";

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
}

class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = { username: "", password: "", redirectToReferrer: false };
        this.handleChange = this.handleChange.bind(this);
        this.Register = this.props.Register.bind(this);
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
    render() {
        const wrongPass = this.state.wrongPass;
        const { from } = this.props.location.state || {
            from: { pathname: "/" }
        };
        if (this.props.loggedIn) {
            return <Redirect to={{ pathname: "/register" }} />;
        } else {
            return (
                <div>
                    <form
                        onSubmit={this.props.Register}
                        className="Register"
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
                            <button>Register</button>
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
export default Register;
