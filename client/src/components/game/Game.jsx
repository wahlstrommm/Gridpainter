import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useChatContext } from "../../context/ChatContextProvider";
import "./game.scss";

const Game = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [connected, setConnected] = useState(false);
  //grid
  const [yourDivs, setYourDivs] = useState([]);
  const { chatUsername, socket } = useChatContext();
  const { room_id } = useParams();
  const navigate = useNavigate();
  const messageRef = useRef();

  const handleIncomingMessage = (msg) => {
    console.log("Received a new chat message", msg);

    // lägger till meddelande i chatt
    setMessages((prevMessages) => [...prevMessages, msg]);
  };

  const handleUpdateUsers = (userlist) => {
    console.log("Got new userlist", userlist);
    setUsers(userlist);
  };

  //hanterar submit av meddelande
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.length) {
      return;
    }

    // construct'ar meddelandeobjektet som skickas
    const msg = {
      username: chatUsername,
      room: room_id,
      content: message,
      // timestamp: Date.now(), ????
    };

    // emittar meddelande
    socket.emit("chat:message", msg);

    // lägger till meddelande i chatt
    setMessages((prevMessages) => [...prevMessages, { ...msg, self: true }]);

    //tömmer input och lägger fokus på input igen
    setMessage("");
    messageRef.current.focus();
  };

  //connectar till rum
  useEffect(() => {
    // Inget användarnamn = redirect till home
    if (!chatUsername) {
      navigate("/");
      return;
    }

    // emittar join request
    socket.emit("user:joined", chatUsername, room_id, (status) => {
      console.log(`Successfully joined ${room_id} as ${chatUsername}`, status);
      setConnected(true);
    });

    // Lyssnar efter meddelanden
    socket.on("chat:message", handleIncomingMessage);

    // Lyssnar efter en uppdaterad användarlista
    socket.on("user:list", handleUpdateUsers);

    return () => {
      // Slutar lyssna
      socket.off("chat:message", handleIncomingMessage);
      socket.off("user:list", handleUpdateUsers);
      socket.emit("user:left", chatUsername, room_id);
    };
  }, [socket, room_id, chatUsername, navigate]);

  const handleBoxClick = (id) => {
    console.log("Click box nr " + id);
  };

  const generateYourDivs = async () => {
    const yourDivBoxes = [];

    for (let i = 1; i < 226; i++) {
      yourDivBoxes.push(
        <div
          className="gridBox"
          key={[i]}
          id={`box${i}`}
          onClick={() => handleBoxClick(i)}
        ></div>
      );
    }

    return setYourDivs(yourDivBoxes);
  };

  useEffect(() => {
    //fokus på message input
    messageRef.current && messageRef.current.focus();
    generateYourDivs();
  }, []);

  // Ifall det inte sker en connection
  if (!connected) {
    return <p>Stand by, connecting....</p>;
  }

  return (
    <div>
      <div id="chat">
        <div>Game och chatt {room_id}</div>
        <div>
          <h2>Users</h2>
          <ul>
            {Object.values(users).map((user, index) => (
              <li key={index}>
                <span className="user-icon">🧑</span> {user}
              </li>
            ))}
          </ul>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            ref={messageRef}
            required
            type="text"
            placeholder="Skicka meddelande"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit">Skicka</button>
        </form>
        <div>
          <ul>
            {messages.map((message, i) => (
              <li key={i}>
                <span className="user">{message.username}: </span>
                <span className="content">{message.content}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Kolla magnus exempel ist kanske??? dunno */}
      <div className="parent" id="gameboard">
        {yourDivs}
      </div>
      <div id="resultboard"></div>
    </div>
  );
};

export default Game;
