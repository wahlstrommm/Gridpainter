const debug = require("debug")("gridpainter:socket_controller");
let io = null;

// lista av fasta rum
const rooms = [
  {
    id: "room1",
    name: "Room 1",
    users: {},
  },
  {
    id: "room2",
    name: "Room 2",
    users: {},
  },
  {
    id: "room3",
    name: "Room 3",
    users: {},
  },
];

let userList = [];

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

  this.broadcast.to(room.id).emit("user:disconnected", room.users[this.id]);

  delete room.users[this.id];

  this.broadcast.to(room.id).emit("user:list", room.users);
};

let currentColor;

//när en användare joinar
const handleUserJoined = function (username, room_id, callback) {
  debug(
    `User ${username} with socket id ${this.id} wants to join room '${room_id}'`
  );

  this.join(room_id);

  debug(room_id.size);

  const room = getRoomById(room_id);

  room.users[this.id] = username;

  this.broadcast.to(room.id).emit("user:joined", username);
 
  callback({
    success: true,
    roomName: room.name,
    users: room.users,
  });

  debug(room.users);
  debug(Object.values(room.users).length)

  //console.log("Room users" + room[0].users, room[0].users);
  // console.log("UserName", room.users[this.id]);
  // console.log(Object.values(room.users));

  // let players = [1,2,3,4]
  
  // console.log(counter);
  
  
  
  if (Object.values(room.users).length === 1 || Object.values(room.users).length <= 2) {
    if (Object.values(room.users).length == 2) {
      let colors = ['blue', 'red'];
      let users = Object.values(room.users);
    
      colors.forEach((color, i) => {
        currentUser = users[i];
        currentColor = color
        console.log("Test", currentColor,currentUser);
      });
    }
    io.to(room.id).emit("roomAvailability", 'får spela');


    debug('Hej här spela');

    let keys = Object.keys(room.users);
    let values = Object.values(room.users);
    let userObject = {"id": keys, "username" : values, "color": currentColor};
    
    userList.push(userObject);
    
  } else {
    io.to(room.id).emit("roomAvailability", 'får inte spela');
  }

  io.to(room.id).emit("user:list", room.users);
};

//hanterar när en användare skickar ett meddelande
const handleChatMessage = async function (data) {
  debug("Someone said something: ", data);
  // console.log("DATA",data);

  const room = getRoomById(data.room);

  // emit `chat:message` event to everyone EXCEPT the sender
  this.broadcast.to(room.id).emit("chat:message", data);
};

//hanterar när en användare går ur ett rum
const handleUserLeft = async function (username, room_id) {
  debug(`User ${username} with socket id ${this.id} left room '${room_id}'`);

  this.leave(room_id);

  const room = getRoomById(room_id);

  delete room.users[this.id];

  this.broadcast.to(room.id).emit("user:left", username);

  io.to(room.users).emit("user:list", room.users);
};

//hantera när en ruta är klickad
const handleColoredPiece = async function (piece, color, roomId) {

  // console.log("ID:",piece,"Färg:",color, roomId);
  
  io.to(roomId).emit("coloredPiece", piece, color);
};

//exporterar controllern
module.exports = function (socket, _io) {
  io = _io;

  debug(`Client ${socket.id} connected`);

  //hanterar handleGetRoomList
  socket.on("get-room-list", handleGetRoomList);

  //hanterar handleUserJoined
  socket.on("user:joined", handleUserJoined);

  //hanterar handleDisconnect
  socket.on("disconnect", handleDisconnect);

  //hanterar handleChatMessage
  socket.on("chat:message", handleChatMessage);

  //hanterar handleUserLeft
  socket.on("user:left", handleUserLeft);

  //hanterar handleColoredPiece
  socket.on("coloredPiece", handleColoredPiece);
};
