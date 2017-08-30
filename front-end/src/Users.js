/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import React, { Component } from "react";
class users extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        let userArray = this.props.usersProps.users.map((user, index) => {
            const active = user === this.props.usersProps.currentuser
                ? "active"
                : "";
            return (
                <li key={index} onClick="">
                    <p className="">{user}</p>
                </li>
            );
        });
        return (
            <div className="users">
                <ul>
                    {userArray}
                    <li />
                </ul>
            </div>
        );
    }
}
export default users;
