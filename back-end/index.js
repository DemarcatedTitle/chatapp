/* eslint-disable no-console */
const Hapi = require("hapi");
const Joi = require("joi");
const Inert = require("inert");
const path = require("path");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// const socketioJwt = require("socketio-jwt");
const secret = "nevershareyoursecret";

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
var token = JWT.sign(people[1], secret, { expiresIn: 60 });

var validate = function(decoded, request, callback) {
    console.log("validate");
    console.log(decoded);
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
        key: secret,
        validateFunc: validate
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
            path: "/api/register",
            config: {
                auth: false,
                validate: {
                    payload: {
                        username: Joi.string().min(3).max(76),
                        password: Joi.string().min(6)
                    }
                }
            },
            handler: function(request, reply) {
                console.log(request.payload);
                bcrypt.hash(request.payload.password, 10, function(err, hash) {
                    if (err) {
                        reply(err);
                    } else {
                        users.set({
                            password: hash,
                            username: request.payload.username
                        });
                        console.log(users);
                        reply({ text: "success" });
                    }
                });
            }
        },
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
                    bcrypt.compare(
                        password,
                        users.get(request.payload.username).password,
                        function(err, res) {
                            if (res === true) {
                                return reply({
                                    username: username,
                                    idtoken: token
                                });
                            } else {
                                console.log(users);
                                console.log(request.payload.password);
                                console.log(false);
                                return reply(
                                    JSON.stringify({ idtoken: `${res}` })
                                );
                            }
                        }
                    );
                }
                return authenticate(
                    request.payload.username,
                    request.payload.password
                );
            }
        },
        {
            method: "GET",
            path: "/api/auth/jwt",
            handler: function(request, reply) {
                // Use this function to return true or false based on if the jwt is good
                // request.payload.idtoken;
                reply({ text: "success" });
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
            path: "/api/restricted",
            config: { auth: "jwt" },
            handler: function(request, reply) {
                reply("success");
            }
        }
    ]);
});

var io = require("socket.io")(login.listener);

io.use(function(socket, next) {
    const receivedToken = socket.handshake.query.token;
    JWT.verify(receivedToken, secret, function(err) {
        if (err) {
            console.log("io.use \n" + err);
            return next(new Error("Sorry, something went wrong."));
        } else {
            return next();
        }
    });
});

var chatlogs = [];

io.on("connection", function(socket) {
    let userToken = socket.handshake.query.token;
    io.emit("chat message", chatlogs.slice(-10));
    JWT.verify(userToken, secret, function(err, decoded) {
        console.log(`${decoded.name} has connected`);
    });
    socket.on("chat message", function(msg) {
        JWT.verify(userToken, secret, function(err, decoded) {
            chatlogs.push({
                date: new Date(),
                message: msg,
                username: decoded.name
            });
            io.emit("chat message", chatlogs);
            console.log("Message received");
        });
    });
});
server.start();
