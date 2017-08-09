/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React from "react";
import PropTypes from "prop-types";
import {
    BrowserRouter as Router,
    Route,
    Link,
    Redirect
} from "react-router-dom";
import { withRouter } from "react-router";
// onClick={window.localStorage.clear()}
// <li><Link to="/login">Log in</Link></li>
class LoggedIn extends React.Component {
    static PropTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    };
    constructor(props) {
        super(props);
        this.state = { loggedIn: this.props.loggedIn };
        this.logout = this.logout.bind(this);
    }
    compoenentDidMount() {
        console.log(this.props.loggedIn);
        this.setState({ loggedIn: localStorage.getItem("idtoken") });
    }
    logout() {
        const history = this.props.history;
        this.setState({ loggedIn: null });
        window.localStorage.clear();
        return history.push("/");
    }
    render() {
        console.log(this.state);
        let loggedIn = this.state.loggedIn;
        if (loggedIn === null) {
            return <li><Link to="/login">Log in</Link></li>;
        } else {
            return (
                <li>
                    <button onClick={this.logout}>
                        Sign out of {loggedIn}
                    </button>
                </li>
            );
        }
    }
}
export default withRouter(LoggedIn);
