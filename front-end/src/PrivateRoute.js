/* eslint-disable no-unused-vars */
import React, { Component } from "react";
import {
    BrowserRouter as Router,
    Route,
    Link,
    Redirect
} from "react-router-dom";
const PrivateRoute = ({
    component: Component,
    socket,
    loggedIn,
    chatlogs,
    roomsProps,
    usersProps,
    ...rest
}) => (
    <Route
        {...rest}
        render={props =>
            (loggedIn
                ? <Component
                      roomsProps={roomsProps}
                      usersProps={usersProps}
                      chatlogs={chatlogs}
                      socket={socket}
                      {...props}
                  />
                : <Redirect
                      to={{
                          pathname: "/login"
                      }}
                  />)}
    />
);
export default PrivateRoute;
