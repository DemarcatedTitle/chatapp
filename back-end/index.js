/* eslint-disable no-console */
const Hapi = require("hapi");
const Boom = require("boom");
const Joi = require("joi");
const Inert = require("inert");
const path = require("path");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
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

var validate = function(decoded, request, callback) {
    console.log(decoded);
    if (!users[decoded.username]) {
        return callback(null, false);
    } else {
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
                        users.set(request.payload.username, {
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
                console.log(
                    `request.payload: ${JSON.stringify(request.payload)}`
                );
                // Set expiresIn to a long time to work on front end things.
                var token = JWT.sign(
                    { username: request.payload.username },
                    secret,
                    { expiresIn: 600000 }
                );
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
                                return reply(
                                    Boom.unauthorized(
                                        "Something went wrong, please try logging in"
                                    )
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
            return next(
                new Error("Sorry, something went wrong. Please try logging in.")
            );
        } else {
            return next();
        }
    });
});

var chatlogs = [];
let rooms = new Map();
io.on("connection", function(socket) {
    let userToken = socket.handshake.query.token;
    io.emit("chat message", chatlogs.slice(-10));
    JWT.verify(userToken, secret, function(err, decoded) {
        console.log(`${decoded.username} has connected`);
    });
    socket.on("new room", function(msg) {
        JWT.verify(userToken, secret, function(err, decoded) {
            if (err) {
                io.emit("error", "Something went wrong");
            } else {
                console.log("new room");
                rooms.set(msg, io.of(msg));
                console.log(rooms.get(msg));
            }
        });
    });
    socket.on("chat message", function(msg) {
        JWT.verify(userToken, secret, function(err, decoded) {
            if (err) {
                io.emit("error", "Something went wrong, please try logging in");
            } else {
                // Putting an if statement here that checks date.now()/1000 against decoded.exp
                // Is untenable because if you emit an error in the else, it emits to all clients
                chatlogs.push({
                    date: new Date(),
                    message: msg,
                    username: decoded.username
                });
                io.emit("chat message", chatlogs);
                console.log("Message received");
            }
        });
    });
});
server.start();
