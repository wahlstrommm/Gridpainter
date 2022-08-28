#!/usr/bin/env node

/**
 * Module dependencies.
 */

require("dotenv").config();

const debug = require("debug")("chat:server");
const http = require("http");
const socketio = require("socket.io");
const socket_controller = require("./controllers/socket_controller");

/**
 * Get port from environment.
 */
const port = process.env.PORT || "3000";

/**
 * Create HTTP and Socket.IO server.
 */
const server = http.createServer();
const io = new socketio.Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

/**
 * Handle incoming connections
 */
io.on("connection", (socket) => {
  socket_controller(socket, io);
});

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EADDRINUSE":
      console.error(`Port ${port} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  console.log(`Listening on port ${addr.port}`);
}
