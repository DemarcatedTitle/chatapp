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
    // {
    //     directory: {
    //         path: ".",
    //         redirectToSlash: true,
    //         index: true
    //     }
    // }
});

var io = require("socket.io")(server.listener);
io.on("connection", function(socket) {
    console.log("A user has connected");
    socket.on("chat message", function(msg) {
        io.emit("chat message", msg);
        console.log("message: " + msg);
    });
});
server.start();
