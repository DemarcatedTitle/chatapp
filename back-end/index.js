/* eslint-disable no-console */
/* eslint-disable indent */
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
                bcrypt.hash(request.payload.password, 10, function(err, hash) {
                    if (err) {
                        reply(err);
                    } else {
                        users.set(request.payload.username, {
                            password: hash,
                            username: request.payload.username
                        });
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
                // console.log(
                //     `request.payload: ${JSON.stringify(request.payload)}`
                // );
                // Set expiresIn to a long time to work on front end things.
                var token = JWT.sign(
                    { username: request.payload.username },
                    secret,
                    { expiresIn: 1200 }
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
function chatMessageEmission(room, chatlogs) {
    return JSON.stringify({
        room: room,
        logs: chatlogs.get(room)
    });
}

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

let chatters = new Map();
var chatlogs = new Map();
let rooms = new Map();
io.on("connection", function(socket) {
    let currentRoom = "";
    let userToken = socket.handshake.query.token;
    io.to(socket.id).emit(
        "rooms",
        JSON.stringify({
            rooms: Array.from(rooms.keys()),
            currentRoom: currentRoom
        })
    );
    JWT.verify(userToken, secret, function(err, decoded) {
        chatters.set(socket.id, decoded.username);
        io.in(currentRoom).clients((error, clients) => {
            if (error) throw error;
            io.to(socket.id).emit(
                "users",
                JSON.stringify({
                    users: clients.map(client => chatters.get(client)),
                    currentUser: decoded.username
                })
            );
        });
    });
    socket.on("disconnecting", function(reason) {
        console.log(reason);
        const roomsLeaving = Object.keys(socket.rooms);
        roomsLeaving.forEach(function(room) {
            console.log(room);
            console.log(`${chatters.get(socket.id)} just left`);
            socket.to(room).emit("userLeft", chatters.get(socket.id));

            // io.in(currentRoom).clients((error, clients) => {
            // });
        });
        chatters.delete(socket.id);
    });
    socket.on("new room", function(room) {
        currentRoom = room;
        JWT.verify(userToken, secret, function(err, decoded) {
            if (err) {
                io.emit("error", "Something went wrong");
            } else if (decoded.username) {
                rooms.set(room, io.of(room));
                chatlogs.set(currentRoom, []);
                socket.join(room, () => {
                    // console.log(socket.rooms);
                    socket.broadcast.emit(
                        "rooms",
                        JSON.stringify({
                            rooms: Array.from(rooms.keys())
                        })
                    );
                    io.in(currentRoom).clients((error, clients) => {
                        if (error) throw error;
                        io.to(socket.id).emit(
                            "users",
                            JSON.stringify({
                                users: clients.map(client =>
                                    chatters.get(client)
                                ),
                                currentUser: decoded.username
                            })
                        );
                    });

                    io.to(socket.id).emit(
                        "rooms",
                        JSON.stringify({
                            rooms: Array.from(rooms.keys()),
                            currentRoom: room
                        })
                    );
                });
            }
        });
    });
    JWT.verify(userToken, secret, function(err, decoded) {
        if (err) {
            socket.emit("error", "Something went wrong");
        } else {
            socket.on("chat message", function(message) {
                if (chatlogs.get(currentRoom)) {
                    console.log(`${chatters.get(socket.id)} just spoke`);
                    io.in(currentRoom).clients((error, clients) => {
                        if (error) throw error;
                        console.log(
                            `The following just heard:
                        ${clients.map(function(id) {
                                return chatters.get(id);
                            })}
                        `
                        );
                    });
                    console.log(`room is ${currentRoom}`);
                    chatlogs.get(currentRoom).push({
                        date: new Date(),
                        message: message,
                        username: decoded.username
                    });
                    io
                        .in(currentRoom)
                        .emit(
                            "chat message",
                            chatMessageEmission(currentRoom, chatlogs)
                        );
                }
            });
        }
    });
    socket.on("join", function(room) {
        currentRoom = room;
        JWT.verify(userToken, secret, function(err, decoded) {
            if (err) {
                io.to(socket.id).emit("error", "Something went wrong");
            } else if (decoded.username) {
                io.in(currentRoom).clients(function(error, clients) {
                    if (!clients.includes(users)) {
                        socket
                            .to(room)
                            .emit("userJoined", chatters.get(socket.id));
                    }
                });
                socket.join(room, () => {
                    io.to(socket.id).emit(
                        "rooms",
                        JSON.stringify({
                            rooms: Array.from(rooms.keys()),
                            currentRoom: room
                        })
                    );
                    io.in(currentRoom).clients((error, clients) => {
                        if (error) throw error;
                        io.to(socket.id).emit(
                            "users",
                            JSON.stringify({
                                users: clients.map(client =>
                                    chatters.get(client)
                                ),
                                currentUser: decoded.username
                            })
                        );
                    });
                    // io.in(currentRoom).clients(function(error, clients) {
                    //     if (!clients.includes(users)) {
                    //         socket
                    //             .to(room)
                    //             .emit("userJoined", chatters.get(socket.id));
                    //     }
                    // });

                    io.to(socket.id).emit(
                        "chat message",
                        JSON.stringify({
                            room: room,
                            logs: chatlogs.get(room)
                        })
                    );
                });
            }
        });
    });
});
server.start();
