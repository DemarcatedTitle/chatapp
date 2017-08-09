/* eslint-disable no-console */
const Hapi = require("hapi");
const Inert = require("inert");
const path = require("path");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// const socketioJwt = require("socketio-jwt");

var users = new Map();
var server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: path.join(__dirname, "html")
            }
        }
    }
});
var people = {
    1: {
        id: 1,
        name: "Anthony Valid User"
    }
};
var token = JWT.sign(people[1], "nevershareyoursecret");

console.log(token);
var validate = function(decoded, request, callback) {
    console.log("validate");
    if (!people[decoded.id]) {
        console.log("null, false");
        return callback(null, false);
    } else {
        console.log("null, true");
        return callback(null, true);
    }
};
server.register(Inert, () => {});
server.connection({ port: 8000, labels: "login" });
const login = server.select("login");
login.register(require("hapi-auth-jwt2"), function(err) {
    if (err) {
        console.log(err);
    }
    login.auth.strategy("jwt", "jwt", {
        key: "NeverShareYourSecret",
        validateFunc: validate,
        verifyOptions: { ignoreExpiration: true }
    });
    login.auth.default("jwt");
    login.route([
        {
            // This is where we will log in
            // On the front-end react side you submit the form
            // and it uses fetch() to post to this route
            //
            // And here it will be something like:
            // if request.payload stuff === userinfo
            // return jwt
            method: "POST",
            path: "/api/auth",
            config: { auth: false },
            handler: function(request, reply) {
                function authenticate(username, password) {
                    bcrypt.compare(password, users.get("username"), function(
                        err,
                        res
                    ) {
                        if (true) {
                            return reply({
                                username: username,
                                idtoken: token
                            });
                        } else {
                            console.log(false);
                            return reply(JSON.stringify({ idtoken: `${res}` }));
                        }
                    });
                }
                return authenticate(
                    request.payload.username,
                    request.payload.password
                );
            }
        },
        {
            method: "POST",
            path: "/api/auth/jwt",
            handler: function(request, reply) {
                // Use this function to return true or false based on if the jwt is good
                // request.payload.idtoken;
                reply({ isauthenticated: "false" });
            }
        },
        {
            method: "GET",
            path: "/noauth",
            config: { auth: false },
            handler: function(request, reply) {
                return reply.response({ test: "test" });
            }
        },
        {
            method: "GET",
            path: "/restricted",
            config: { auth: "jwt" },
            handler: function(request, reply) {
                reply({ message: "You used a valid token" }).header(
                    "Authorization",
                    request.headers.authorization
                );
            }
        }
    ]);
});
// server.connection({ port: 4000, labels: "socket.io" });

// const socketio = server.select("socket.io");
// socketio.route({
//     method: "GET",
//     path: "/",
//     handler: function(request, reply) {
//         reply.file("index.html");
//     }
// });

var io = require("socket.io")(login.listener);

io.use(function(socket, next) {
    const receivedToken = socket.handshake.query.token;
    // console.log(token);
    // make sure handshake looks good
    JWT.verify(receivedToken, "nevershareyoursecret", function(err) {
        if (err) {
            console.log(err);
            return next(new Error("Sorry, something went wrong."));
        } else {
            return next();
        }
    });
    // if error do this
    // next
    // else just call next
});

// io.set(
//     "authorization",
//     socketioJwt.authorize({
//         secret: "nevershareyoursecret",
//         handshake: true
//     })
// );

var chatlogs = [];

io.on("connection", function(socket) {
    io.emit("chat message", chatlogs);
    console.log("A user has connected");
    socket.on("chat message", function(msg) {
        chatlogs.push({
            date: new Date(),
            message: msg,
            username: "longer user name let's see how long"
        });
        io.emit("chat message", chatlogs);
        console.log("Message received");
    });
});
server.start();
