/* eslint-disable no-console */
const Hapi = require("hapi");
const Inert = require("inert");
const path = require("path");

var server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: path.join(__dirname, "html")
            }
        }
    }
});

server.register(Inert, () => {});
server.connection({ port: 4000 });

server.route({
    method: "GET",
    path: "/",
    handler: function(request, reply) {
        reply.file("index.html");
    }
});

var io = require("socket.io")(server.listener);

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
        console.log("message: \n" + chatlogs);
    });
});
server.start();
