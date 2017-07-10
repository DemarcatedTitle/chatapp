/* eslint-disable no-console */

var io = require("socket.io-client");

const socket = io("http://localhost:4000");

socket.open();
