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
const socketHandler = require("./socketHandler.js");

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
socketHandler.io(login.listener, secret, users);
server.start();
