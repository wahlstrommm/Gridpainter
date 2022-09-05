require('dotenv').config();
const axios = require('axios');

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
  // debug(`User ${username} with socket id ${this.id} wants to join room '${room_id}'`);

  this.join(room_id);

  const room = getRoomById(room_id);

  room.users[this.id] = username;

  this.broadcast.to(room.id).emit('user:joined', username);

  callback({
    success: true,
    roomName: room.name,
    users: room.users,
  });

  if (Object.values(room.users).length === 1 || Object.values(room.users).length <= 4) {
    io.to(room.id).emit('roomAvailability', 'får spela');

    usersObject = [];

    if (Object.values(room.users).length == 4 && room_id == room.id) {
      //hämta bild
      handleFacit(room.id);
      let colors = ['blue', 'red', 'yellow', 'green'];
      let users = Object.values(room.users);
      let keys = Object.keys(room.users);
      //Skickar ut att timern kan starta. Som det är fyra spelare som är redo att spela
      io.to(room_id).emit('gameClock', room_id, 'start');

      colors.forEach((color, i) => {
        currentUser = users[i];
        let key = keys[i];
        currentColor = color;

        let userObject = { id: key, username: currentUser, color: currentColor };
        usersObject.push(userObject);
        allUsers.push(userObject);
      });
    }
  } else {
    io.to(room.id).emit('roomAvailability', 'får inte spela');
  }

  io.to(room.id).emit('user:list', room.users, usersObject);
};


//hanterar facit
const handleFacit = (room_id) => {
  let allImg = ['63148270d91c31ad1a363a38', '631274fbd0dedd31d93602d0', '63146f30d91c31ad1a363a22', '6314756fd91c31ad1a363a28', '63147d73d91c31ad1a363a2e'];

  let rightPic = allImg[Math.floor(Math.random() * allImg.length)];

  axios.get('http://localhost:4000/img/imgs').then((res) => {
    res.data.forEach((element, i) => {

      if (element._id == rightPic) {
        io.to(room_id).emit('facitPic', rightPic, element.img);
        return;
      }
    });
  });
};

//hanterar när en användare skickar ett meddelande
const handleChatMessage = async function (data) {
  debug('Someone said something: ', data);

  const room = getRoomById(data.room);

  this.broadcast.to(room.id).emit('chat:message', data);
};

//hanterar när en användare går ur ett rum
const handleUserLeft = async function (username, room_id) {
  // debug(`User ${username} with socket id ${this.id} left room '${room_id}'`);

  this.leave(room_id);

  const room = getRoomById(room_id);

  delete room.users[this.id];

  this.broadcast.to(room.id).emit('user:left', username);

  io.to(room.users).emit('user:list', room.users);
};

//hantera när en ruta är klickad
const handleColoredPiece = async function (piece, roomId, socketId) {
  let rightColor;

  for (let i = 0; i < allUsers.length; i++) {
    rightColor = allUsers[i].color;

    if (allUsers[i].id == socketId) {
      io.to(roomId).emit('coloredPiece', piece, rightColor, this.id, true);
    } else {
      console.log('ingen matchning');
    }
  }
};

let room1List = [];
let room2List = [];
let room3List = [];

//hantera att en Klar-knapp är klickad
const handleDonePlaying = (socketId, roomId, pointsCounter) => {

  let room1 = 'room1';
  let room2 = 'room2';
  let room3 = 'room3';

  if (roomId == room1) {
    room1List.push({ socketId: socketId, points: pointsCounter });
  } else if (roomId == room2) {
    room2List.push({ socketId: socketId, points: pointsCounter });
  } else if (roomId == room3) {
    room3List.push({ socketId: socketId, points: pointsCounter });
  } else {
    console.log('Ingen matchning i rum');
  }

  if (room1List.length || room2List.length || room3List.length == 4) {
    if (room1List.length == 4) {
      io.to(roomId).emit('donePlaying', 'done', room1List[3].points);
      room1List = [];
    } else if (room2List.length == 4) {
      io.to(roomId).emit('donePlaying', 'done', room2List[3].points);
      room2List = [];
    } else if (room3List.length == 4) {
      io.to(roomId).emit('donePlaying', 'done', room3List[3].points);
      room3List = [];
    } else {
      console.log('Hamnar i else');
    }
  } else {
    // io.to(roomId).emit('donePlaying', 'nej');
  }
};

let userListThatPressedDone = 0;
let times = [];
const handleGameClock = (roomId, state, timeFromUser) => {
  //"klar" kommer när en spelare trycker på sin klar knapp.
  if (state == 'klar') {
    //lägger till en. För varje spelare som är klar.
    userListThatPressedDone++;
    //pushar in det i en lista som håller alla tider från alla fyra spelare
    times.push(timeFromUser);
    //Här har alla klickat klar!
    if (userListThatPressedDone === 4) {
      //När alla är klara vill vi ha den sista tiden. Alltså den sista i listan. index 3.
      io.to(roomId).emit('gameClock', roomId, 'stop', times[3]);
      //sen nollställs både "counter" och listan med tider.
      userListThatPressedDone = 0;
      times = [];
    } else {
      io.to(roomId).emit('gameClock', roomId, userListThatPressedDone);
    }
  } else {
    io.to(roomId).emit('gameClock', state, userListThatPressedDone);
  }
  //skickar ut till alla att någon har klickat på "klar"
};

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

  // hanterar klocka
  socket.on('gameClock', handleGameClock);
};

