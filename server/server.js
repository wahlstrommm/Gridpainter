const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const galleryRouter = require("./routes/gallery");
const imgRouter = require("./routes/img");
require("dotenv").config();

const debug = require("debug")("chat:server");
const http = require("http");
const socketio = require("socket.io");
const socket_controller = require("./controllers/socket_controller");

const MongoClient = require("mongodb").MongoClient;


const uri = process.env.MONGOATLAS;
MongoClient.connect(uri, {
  useUnifiedTopology: true
}).then(client => {
  console.log("Connected to MongoDB Atlas!");
    const db= client.db("Gallery");
    app.locals.db = db;
  });


/**
 * Get port from environment.
 */
const port = process.env.PORT || "3000";

/**
 * Create HTTP and Socket.IO server.
 */
const server = http.createServer(app);
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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname)));
app.use(cors());

app.use("/gallery", galleryRouter);
app.use("/img", imgRouter);

app.get("/", (req, res) => {
  res.send('welcome to app');
});


module.exports = app;