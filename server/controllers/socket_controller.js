const debug = require("debug")("gridpainter:socket_controller");
let io = null;

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

const getRoomById = (id) => {
  debug(id);
  return rooms.find((room) => room.id === id);
};

const getRoomByUserId = (id) => {
  return rooms.find((chatroom) => chatroom.users.hasOwnProperty(id));
};

const handleGetRoomList = function (callback) {
  const room_list = rooms.map((room) => {
    return {
      id: room.id,
      name: room.name,
    };
  });
  callback(room_list);
};

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

const handleUserJoined = function (username, room_id, callback) {
  debug(
    `User ${username} with socket id ${this.id} wants to join room '${room_id}'`
  );

  this.join(room_id);

  const room = getRoomById(room_id);

  room.users[this.id] = username;

  this.broadcast.to(room.id).emit("user:joined", username);

  callback({
    success: true,
    roomName: room.name,
    users: room.users,
  });

  io.to(room.id).emit("user:list", room.users);
};

const handleChatMessage = async function (data) {
  debug("Someone said something: ", data);

  const room = getRoomById(data.room);

  // emit `chat:message` event to everyone EXCEPT the sender
  this.broadcast.to(room.id).emit("chat:message", data);
};

const handleUserLeft = async function (username, room_id) {
  debug(`User ${username} with socket id ${this.id} left room '${room_id}'`);

  this.leave(room_id);

  const room = getRoomById(room_id);

  delete room.users[this.id];

  this.broadcast.to(room.id).emit("user:left", username);

  io.to(room.id).emit("user:list", room.users);
};

module.exports = function (socket, _io) {
  io = _io;

  debug(`Client ${socket.id} connected`);

  socket.on("get-room-list", handleGetRoomList);

  socket.on("user:joined", handleUserJoined);

  socket.on("disconnect", handleDisconnect);

  socket.on("chat:message", handleChatMessage);

  socket.on("user:left", handleUserLeft);
};
