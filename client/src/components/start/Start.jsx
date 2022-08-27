import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatContext } from "../../context/ChatContextProvider";

// const socket = io('http://localhost:3001', {
//     "autoConnect": false,
//     withCredentials: true,
//     extraHeaders: {
//         "Gridpainter": "abcd"
//     }
// });

const Start = () => {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState();
  const [roomlist, setRoomlist] = useState([]);
  const { setChatUsername, socket } = useChatContext();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    setChatUsername(username);

    navigate(`/game/${room}`);
  };

  useEffect(() => {
    socket.emit("get-room-list", (rooms) => {
      setRoomlist(rooms);
    });
  }, [socket]);

  // useEffect(() => {
  //   console.log(room, roomlist);
  // }, []);

  return (
    <div>
      <section className="startSection">
        <h1 className="h1Start">Hej välkommen till vårt spel hihi</h1>

        <form className="userForm" onSubmit={handleSubmit}>
          <div>
            <label>Username</label>
            <input
              className="userInput"
              type="text"
              name="userName"
              value={username}
              id="name"
              placeholder="Enter your name"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          {/* <input className="userInput" type="text" name='roomName' value={userInfo.roomName} placeholder="Enter room" onChange={handleChange} /> */}
          <div>
            <label>Room</label>

            <select
              onChange={(e) => setRoom(e.target.value)}
              required
              value={room}
            >
              {roomlist.length === 0 && <option disabled>Loading...</option>}
              {roomlist.length && (
                <>
                  <option value="">Select a room to join</option>
                  {roomlist.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
          <input
            className="playBtn"
            type="submit"
            value="Submit"
            disabled={!username || !room}
          />
        </form>

        {/* <button className="galleryBtn">Galleri</button> */}
      </section>
    </div>
  );
};

export default Start;
