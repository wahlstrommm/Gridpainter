var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
const server = require("http").Server(app);
// const io = require("socket.io")(server);



// const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require('http');

app.use(cors());

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Gridpainter"],
    credentials: true
  }
});


// require('dotenv').config();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// async function init() {
//     try {
//       await mongoose.connect(process.env.MONGOATLAS);
//       console.log("Connected to database.");
//     } catch (err) {
//       console.error(err);
//     }
// }

// init();

io.on("connection", (socket) => {
  // console.log(`User id: ${socket.id} is connected`);

  socket.on('msg', (e) => {
    console.log(e);
    // socket.broadcast.emit('msg', e);
  });


  // socket.emit()
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  // socket.on("con", (msg) => {
  //   console.log(msg);
  //   io.emit(msg);
  // });
});

module.exports = { app: app, server: server };


