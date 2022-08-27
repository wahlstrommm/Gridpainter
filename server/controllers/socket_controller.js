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
    id: "room2",
    name: "Room 2",
    users: {},
  },
];

const getRoomById = (id) => {
  return rooms.find((room) => room.id === id);
};

const handleUserJoined = async function (username, room_id, callback) {
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

module.exports = function (socket, _io) {
  io = _io;

  debug(`Client ${socket.id} connected`);
};
