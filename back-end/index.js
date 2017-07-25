/* eslint-disable no-console */
const Hapi = require("hapi");
const Inert = require("inert");
const path = require("path");
const JWT = require("jsonwebtoken");

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
            method: "GET",
            path: "/",
            config: { auth: false },
            handler: function(request, reply) {
                reply({ text: "Token not required" });
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

// var io = require("socket.io")(server.listener);

// var chatlogs = [];

// io.on("connection", function(socket) {
//     io.emit("chat message", chatlogs);
//     console.log("A user has connected");
//     socket.on("chat message", function(msg) {
//         chatlogs.push({
//             date: new Date(),
//             message: msg,
//             username: "longer user name let's see how long"
//         });
//         io.emit("chat message", chatlogs);
//         console.log("Message received");
//     });
// });
server.start();
