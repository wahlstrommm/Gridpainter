require("dotenv").config();
const debug = require('debug')('gridpainter:socket_controller');
let io = null;

// lista av fasta rum
const rooms = [
  {
    id: 'room1',
    name: 'Room 1',
    users: {},
  },
  {
    id: 'room2',
    name: 'Room 2',
    users: {},
  },
  {
    id: 'room3',
    name: 'Room 3',
    users: {},
  },
];

//hämtar rum med id
const getRoomById = (id) => {
  debug(id);
  return rooms.find((room) => room.id === id);
};

//hämtar rum med userid
const getRoomByUserId = (id) => {
  return rooms.find((chatroom) => chatroom.users.hasOwnProperty(id));
};

//hämtar lista av rum av en användare
const handleGetRoomList = function (callback) {
  const room_list = rooms.map((room) => {
    return {
      id: room.id,
      name: room.name,
    };
  });
  callback(room_list);
};

//när en användare disconnectar
const handleDisconnect = function () {
  debug(`Client ${this.id} disconnected :(`);

  const room = getRoomByUserId(this.id);

  if (!room) {
    return;
  }

  this.broadcast.to(room.id).emit('user:disconnected', room.users[this.id]);

  delete room.users[this.id];

  this.broadcast.to(room.id).emit('user:list', room.users);
};

let currentColor;
let usersObject = [];
let allUsers = [];

//när en användare joinar
const handleUserJoined = function (username, room_id, callback) {
  debug(`User ${username} with socket id ${this.id} wants to join room '${room_id}'`);

  this.join(room_id);

  const room = getRoomById(room_id);

  room.users[this.id] = username;

  this.broadcast.to(room.id).emit('user:joined', username);

  callback({
    success: true,
    roomName: room.name,
    users: room.users,
  });

  if (Object.values(room.users).length === 1 || Object.values(room.users).length <= 2) {
    io.to(room.id).emit('roomAvailability', 'får spela');
    debug('Hej här spela');
    debug('room_id', room_id, 'room.id', room.id);

    usersObject = [];

    if (Object.values(room.users).length == 2 && room_id == room.id) {
      let colors = ['blue', 'red'];
      let users = Object.values(room.users);
      let keys = Object.keys(room.users);

      colors.forEach((color, i) => {
        currentUser = users[i];
        let key = keys[i];
        currentColor = color;

        console.log('Test', key, currentUser, currentColor);
        let userObject = { id: key, username: currentUser, color: currentColor };
        usersObject.push(userObject);
        allUsers.push(userObject);
        debug('vårt objekt', userObject);
      });
    }
  } else {
    io.to(room.id).emit('roomAvailability', 'får inte spela');
  }

  io.to(room.id).emit('user:list', room.users, usersObject);
};

//hanterar när en användare skickar ett meddelande
const handleChatMessage = async function (data) {
  debug('Someone said something: ', data);

  const room = getRoomById(data.room);

  // emit `chat:message` event to everyone EXCEPT the sender
  this.broadcast.to(room.id).emit('chat:message', data);
};

//hanterar när en användare går ur ett rum
const handleUserLeft = async function (username, room_id) {
  debug(`User ${username} with socket id ${this.id} left room '${room_id}'`);

  this.leave(room_id);

  const room = getRoomById(room_id);

  delete room.users[this.id];

  this.broadcast.to(room.id).emit('user:left', username);

  io.to(room.users).emit('user:list', room.users);
};

//hantera när en ruta är klickad
const handleColoredPiece = async function (piece, roomId, socketId) {
  let rightColor;

  console.log("log rad 141", piece, roomId, socketId);

  for (let i = 0; i < allUsers.length; i++) {
    rightColor = allUsers[i].color;

    if (allUsers[i].id == socketId) {
      io.to(roomId).emit('coloredPiece', piece, rightColor, this.id);
    } else {
      console.log('ingen matchning');
    }
  }
};

let counter = 0;

//hantera att en Klar-knapp är klickad
const handleDonePlaying = (socketId, roomId) => {
  console.log('Socket:', socketId);
  console.log(roomId);
  console.log('Counter:', counter);
  counter++;
  console.log('Counter:', counter);
  if (counter == 2) {
    console.log("hamnar i doneplaying, if-sats");
    io.to(roomId).emit('donePlaying', 'done');

    counter = 0;
  } else {
    // io.to(roomId).emit('donePlaying', 'nej');
  }
};

//hanterar att spara en bild
// let images = [[], [], []];

// const handleSaveImg = async function (img, roomId) {
//   console.log('img', img, roomId);
// const url = (process.env.MONGOATLAS);
// mongoose.connect(url)


// images.push(img);
// console.log("images", images.length);
// Här kan man jämföra med de bilderna vi har istället jag provade det 
// let count = 0;

// images.forEach(el => {
// for (let i = 0; i < img; i++){
//   if (el.color == img[i].color) {
//     count++;
//     console.log('image is equal to img', count);
//     console.log(roomId);
//     io.to(roomId).emit('result', 'success');
//   }
//   else if (el.color == img[i].color) {
//     count--;
//     console.log('image is not equal to img ', count);
//     io.to(roomId).emit('result', 'fail');
//   }
// });
// };

//exporterar controllern
module.exports = function (socket, _io) {
  io = _io;

  debug(`Client ${socket.id} connected`);

  //hanterar handleGetRoomList
  socket.on('get-room-list', handleGetRoomList);

  //hanterar handleUserJoined
  socket.on('user:joined', handleUserJoined);

  //hanterar handleDisconnect
  socket.on('disconnect', handleDisconnect);

  //hanterar handleChatMessage
  socket.on('chat:message', handleChatMessage);

  //hanterar handleUserLeft
  socket.on('user:left', handleUserLeft);

  //hanterar handleColoredPiece
  socket.on('coloredPiece', handleColoredPiece);

  //hanterar spelare som är "klara"
  socket.on('donePlaying', handleDonePlaying);

  // //hanterar spelare som är "klara"
  // socket.on('saveImg', handleSaveImg);
};

