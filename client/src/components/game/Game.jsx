import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useChatContext } from '../../context/ChatContextProvider';
// import { PostImgService } from '../../services/PostImgService';
import './game.scss';
import axios from "axios";

const Game = () => {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [connected, setConnected] = useState(false);
  const [color, setColor] = useState('');
  const [done, setDone] = useState(false);
  const [allDone, setAllDone] = useState(false);
  // const [save, setSave] = useState([]);
  //grid
  const [yourDivs, setYourDivs] = useState([]);
  const { chatUsername, socket } = useChatContext();
  const { room_id } = useParams();
  const navigate = useNavigate();
  const messageRef = useRef();

 
  const handleIncomingMessage = (msg) => {
    console.log('Received a new chat message', msg);

    // lägger till meddelande i chatt
    setMessages((prevMessages) => [...prevMessages, msg]);
  };

  const handleUpdateUsers = (userlist, userObject) => {
    console.log('Got new userlist', userObject);
    setColor(userObject.color);

    setUsers(userlist);
  };

  const handleRoomStatus = (roomStatus) => {
    console.log(roomStatus);
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
    socket.emit('chat:message', msg);

    // lägger till meddelande i chatt
    setMessages((prevMessages) => [...prevMessages, { ...msg, self: true }]);

    //tömmer input och lägger fokus på input igen
    setMessage('');
    messageRef.current.focus();
  };

  //connectar till rum
  useEffect(() => {
    // Inget användarnamn = redirect till home
    if (!chatUsername) {
      navigate('/');
      return;
    }

    // emittar join request
    socket.emit('user:joined', chatUsername, room_id, (status) => {
      // console.log(`Successfully joined ${room_id} as ${chatUsername}`, status);

      setConnected(true);
    });

    socket.on('roomAvailability', handleRoomStatus);

    // Lyssnar efter meddelanden
    socket.on('chat:message', handleIncomingMessage);

    // Lyssnar efter en uppdaterad användarlista
    socket.on('user:list', handleUpdateUsers);

    // Lyssnar på färgade rutor
    socket.on('coloredPiece', (nr, color, socketId) => {
      console.log(nr, color, socketId);

      setColor(color);
      generateYourDivs(nr, color);
    });

    socket.on("donePlaying", (text) => {
      console.log(text);

      if (text == "done") {
        setAllDone(true);
      }
    });

    socket.on('result', (result) => {
      console.log(result);
      setResult(result);
    });

    return () => {
      // Slutar lyssna
      socket.off('chat:message', handleIncomingMessage);
      socket.off('roomAvailability', handleRoomStatus);
      socket.off('user:list', handleUpdateUsers);
      socket.off('coloredPiece');
      socket.off('result');
      socket.off('user:joined');
      socket.emit('user:left', chatUsername, room_id);
    };
  }, [socket, room_id, chatUsername, navigate, result]);


  // Service för att spara bild
  // useEffect(() => {
  //   // let service = new PostImgService();

  //   service.postImg(save).then(res => {
  //     console.log("Hej från useEffect, save img", res);
  //     console.log(res);
  //   }).catch(err => {
  //     console.log(err);
  //   })
  // }, [save]);

  // hantera klick på en ruta i griden
  const handleBoxClick = (id, socketId) => {
    console.log('Click box nr ' + id, color);
    socket.emit('coloredPiece', id, room_id, socketId);
  };

  const generateYourDivs = async (nr, color) => {
    const yourDivBoxes = [];

    for (let i = 1; i < 226; i++) {
      yourDivBoxes.push(<div className="gridBox" key={[i]} id={`box${i}`} onClick={() => handleBoxClick(i, socket.id)}></div>);

      if (nr == i) {
        document.getElementById('box' + i).style.background = color;
      }
    }

    return setYourDivs(yourDivBoxes);
  };

  

  //event för klar knappen
  const donePlaying = () => {
    //id, boolean
    console.log(socket.id);
    //IF SocketID + Color etc.
    socket.emit('donePlaying', socket.id, room_id);
    // children till YourDivs? 
    console.log(yourDivs);

    let gameboard = document.getElementById("gameboard");

    let colorBoard = [];

    // let gameImg = [];
    for (let i = 0; i < gameboard.children.length; i++) {
      console.log("Children:", gameboard.children[i].id, " är ", gameboard.children[i].style.backgroundColor);
      console.log("Children:", gameboard.children[i].style);

      let eachDiv = { "id": gameboard.children[i].id, "color": gameboard.children[i].style.backgroundColor };
      if (eachDiv.color == "") {
        eachDiv.color = "0";
        colorBoard.push(eachDiv);
      }
      else {
        colorBoard.push(eachDiv);
      }
    }
    console.log("COLORBOARD Utanför", colorBoard);

    setDone(true);
    // socket.emit('saveImg', colorBoard, room_id);

    // setSave(colorBoard);
    // console.log("SAVE", save[0]);

    
    //  const postImg = async () => {
    //   const response = await axios.post("http://localhost:4000/img/save", colorBoard);
    //   console.log(response.data);
    // } 


    axios.post("http://localhost:4000/save", colorBoard, {
      headers: {
        "Content-Type": "application/json"
      }
    }).then(res => {
      console.log("Hej från axios, save img", res);
      console.log(res);
    }).catch(err => {
      console.log(err);
    })
    
  };

  const saveImg = () => {
    // console.log("saveImag");
    console.log(result);
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
            <input ref={messageRef} required type="text" placeholder="Skicka meddelande" value={message} onChange={(e) => setMessage(e.target.value)} />
            <button type="submit" id="submit">
              Skicka
            </button>
          </form>
        </div>
      </div>


      <div className="parent" id="gameboard" >
        {yourDivs}
      </div>
      <div id="resultboard" style={{ display: allDone ? 'block' : 'none' }}>
        <div className='containerResult'>
          <h2>Resultat</h2>
          <h3>{result}</h3>
          {/* <h3>100% rätt</h3> */}
          <button className="resultBtn" onClick={saveImg}>Ladda ner bild</button>
          <button className="resultBtn">
            <Link to="/">Spela igen</Link>
          </button>
        </div>
      </div>

      <div className="leftWrapper">
        <div>
          <img src="" alt="computer" />
        </div>
        <div>Tid: 276sek</div>
        <button id="btnDone" disabled={done} onClick={donePlaying}>Klar</button>
      </div>
    </div>
  );
};

export default Game;

