import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useChatContext } from "../../context/ChatContextProvider";
import "./game.scss";

const Game = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [connected, setConnected] = useState(false);
  const [color, setColor] = useState("");
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

  const handleUpdateUsers = (userlist, userObject) => {
    console.log("Got new userlist", userlist, userObject);
    // setColor(userObject.);
    setUsers(userlist);
  };

  const handleRoomStatus = (roomStatus) => {
    console.log(roomStatus)
  }

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
      // console.log(`Successfully joined ${room_id} as ${chatUsername}`, status);

      setConnected(true);
    });

  //   socket.on('roomAvailability', (roomStatus) => {
  //     console.log(roomStatus); 
  // })

      socket.on('roomAvailability', handleRoomStatus)

    // Lyssnar efter meddelanden
    socket.on("chat:message", handleIncomingMessage);

    // Lyssnar efter en uppdaterad användarlista
    socket.on("user:list", handleUpdateUsers);

    // Lyssnar på färgade rutor
    socket.on("coloredPiece",(nr, color)=>{
      console.log(nr,color)

      generateYourDivs(nr, color)
    })

    return () => {
      // Slutar lyssna
      socket.off("chat:message", handleIncomingMessage);
      socket.off('roomAvailability', handleRoomStatus)
      socket.off("user:list", handleUpdateUsers);
      socket.off("coloredPiece");
      socket.off("user:joined");
      socket.emit("user:left", chatUsername, room_id);
    };
  }, [socket, room_id, chatUsername, navigate]);

  const handleBoxClick = (id) => {
    console.log("Click box nr " + id, "blue");
    socket.emit("coloredPiece", id, "blue", room_id)
  };

  const generateYourDivs = async (nr, color) => {
    const yourDivBoxes = [];

    // console.log(nr, color);

    for (let i = 1; i < 226; i++) {
      yourDivBoxes.push(
        <div
          className="gridBox"
          key={[i]}
          id={`box${i}`}
          onClick={() => handleBoxClick(i)}
        ></div>
      );

      if(nr == i) {
        document.getElementById("box"+i).style.background = color;
      }
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
    <div id="Wrapper">
      <div id="chat">
        <div>
          <h2>Game och chatt {room_id}</h2>
          <h3>Users</h3>
          <ul>
            {Object.values(users).map((user, index) => (
              <li key={index}>
                <span className="user-icon">🧑</span> {user}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <ul>
            {messages.map((message, i) => (
              <li key={i}>
                <span className="user">{message.username}: </span>
                <span className="content">{message.content}</span>
              </li>
            ))}
          </ul>
          <form onSubmit={handleSubmit}>
            <input
              ref={messageRef}
              required
              type="text"
              placeholder="Skicka meddelande"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" id="submit">Skicka</button>
          </form>
        </div>
      </div>
      {/* Kolla magnus exempel ist kanske??? dunno */}

      <div className="parent" id="gameboard">
        {yourDivs}
      </div>
      <div id="resultboard">
        <h2>Resultat</h2>
        <h3>Tid: 276sek</h3>
        <h3>100% rätt</h3>
        <button className="resultBtn">Ladda ner bild</button>
        <button className="resultBtn"><Link to='/'>Spela igen</Link></button>
      </div>


      <div className="leftWrapper">
        <div>
          <img src="" alt="computer" />
        </div>
      <div>Tid: 276sek</div>
      </div>
    </div>
  );
};

export default Game;
