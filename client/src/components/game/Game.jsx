import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useChatContext } from '../../context/ChatContextProvider';
// import { PostImgService } from '../../services/PostImgService';
import './game.scss';

import axios from 'axios';
import img1 from './6310a34fd91c31ad1a363a03.png';

// import 6310a34fd91c31ad1a363a03 from
// alla bilder i en array
// for loop
// if(monogDB_id == imgArray[i])
// matchning = img.src

const Game = () => {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [connected, setConnected] = useState(false);
  const [color, setColor] = useState('');
  const [done, setDone] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [start, SetStart] = useState(false);
  const [pointsCounter, setPointsCounter] = useState(1);
  //grid
  const [yourDivs, setYourDivs] = useState([]);
  const { chatUsername, socket } = useChatContext();
  const { room_id } = useParams();
  const navigate = useNavigate();
  const messageRef = useRef();

  const [img1, setImg1] = useState({});

  // const effectRan = useRef(false);

  // useEffect(() => {
  //    const getImgs = () => {
  //     axios.get("http://localhost:4000/img/imgs").then(res => {
  //       console.log(res.data);
  //     })
  //   }
  //   return () => {
  //     console.log("Game component unmount");
  //     effectRan.current = true;
  //   }
  // },[])

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
    socket.on('coloredPiece', (nr, color, socketId, state) => {
      console.log(nr, color, socketId, state);

      setColor(color);
      SetStart(state);
      generateYourDivs(nr, color);
    });

    socket.on('donePlaying', (text) => {
      console.log(text);

      if (text === 'done') {
        setAllDone(true);
      }
    });

    // socket.on('result', (result) => {
    //   console.log(result);
    //   setResult(result);
    // });

    return () => {
      // Slutar lyssna
      socket.off('chat:message', handleIncomingMessage);
      socket.off('roomAvailability', handleRoomStatus);
      socket.off('user:list', handleUpdateUsers);
      socket.off('coloredPiece');
      // socket.off('result');
      socket.off('user:joined');
      socket.emit('user:left', chatUsername, room_id);
    };
  }, [socket, room_id, chatUsername, navigate, result]);

  // let facit = [];
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

  // let startCounting = 0;

  // // timer som räknar upp sekunder
  // const gameTime = () => {
  //   setInterval(() => {
  //     ++startCounting;

  //     let hour = Math.floor(startCounting / 3600);
  //     let minute = Math.floor(startCounting - hour*3600)/60;
  //     let seconds = startCounting - (hour*3600 + minute*60)

  //     if (hour < 10) {
  //       hour = "0"+hour;
  //     }
  //     if (minute < 10) {
  //       minute = "0"+minute;
  //     }
  //     if (seconds < 10) {
  //       seconds = "0"+seconds;
  //     }
  //     setResult(startCounting);
  //   }, 1000);
  // };

  // hantera klick på en ruta i griden
  const handleBoxClick = (id, socketId) => {
    if (start) {
      SetStart(false);
    } else {
      SetStart(true);
    }

    console.log('Click box nr ' + id, color, socketId);
    socket.emit('coloredPiece', id, room_id, socketId, true);
  };

  const handleClickStart = () => {
    console.log('Start');

    // gameTime();

    let rightPictures = [];

    rightPictures.push('6310a34fd91c31ad1a363a03');
    console.log(rightPictures);

    axios.get('http://localhost:4000/img/imgs').then((res) => {
      let imgsContainer = document.getElementById('imgsContainer');
      console.log(res.data);

      res.data.forEach((i) => {
        console.log(i._id);
        if (i._id == rightPictures[0]) {
          console.log(rightPictures[0]);
          console.log('Rätt bild');
          console.log(i);
          // facit.push(i);
          // console.log(typeof (facit));
          console.log(typeof i.img);
          // console.log(facit);
          setImg1(i.img);
          console.log(img1);
        }
      });
    });
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

    let gameboard = document.getElementById('gameboard');
    let colorBoard = [];

    for (let i = 0; i < gameboard.children.length; i++) {
      // console.log("Children:", gameboard.children[i].id, " är ", gameboard.children[i].style.backgroundColor);
      // console.log("Children:", gameboard.children[i].style);

      let eachDiv = { id: gameboard.children[i].id, color: gameboard.children[i].style.backgroundColor };
      if (eachDiv.color == '') {
        eachDiv.color = 'white';
        colorBoard.push(eachDiv);
      } else {
        colorBoard.push(eachDiv);
      }
    }

    console.log('FACIT:', img1);
    console.log('COLORBOARD', colorBoard);
    // let res = img1.img;

    let counter = 0;

    colorBoard.forEach((num1, index) => {
      const num2 = img1[index];
      console.log('colorBoard:', num1.color, 'Facit:', num2.color);

      if (num1.color === num2.color) {
        counter++;
        console.log('Rätt', counter);

        let percent = (counter / 225) * 100;
        console.log(percent);

        setPointsCounter(Math.round(percent));
      } else {
        console.log('Fel');
      }

      console.log(pointsCounter);
    });

    console.log('COLORBOARD Utanför', colorBoard);

    setDone(true);

    // facit.forEach(function (item, index) {
    //   console.log(item, colorBoard[index]);
    // });

    let players = Object.values(users);
    let date = new Date();
    let dateString = date.toLocaleString();
    console.log('USER', players);
    axios
      .post(
        'http://localhost:4000/img/save',
        { colorBoard, room_id, players, dateString },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .then((res) => {
        console.log('Hej från axios, save img', res);
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // const saveImg = () => {
  //   // console.log("saveImag");
  //   console.log(result);
  // };

  const Progress = ({ done }) => {
    const [style, setStyle] = React.useState({});

    setTimeout(() => {
      const newStyle = {
        opacity: 1,
        width: `${pointsCounter}%`,
      };

      setStyle(newStyle);
    }, 200);

    return (
      <div className="progress">
        <div className="progress-done" style={style}>
          {done}%
        </div>
      </div>
    );
  };
  useEffect(() => {
    //fokus på message input
    messageRef.current && messageRef.current.focus();
    generateYourDivs();
  }, []);

  // useEffect(() => {
  // 	messageEndRef.current?.scrollIntoView({
  // 		behavior: 'smooth',
  // 	});
  // }, [messages]);

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
            {/* <div classname='messageref' ref={messageEndRef} /> */}
          </ul>
          <form onSubmit={handleSubmit}>
            <input ref={messageRef} required type="text" placeholder="Skicka meddelande" value={message} onChange={(e) => setMessage(e.target.value)} />
            <button type="submit" id="submit">
              Skicka
            </button>
          </form>
        </div>
      </div>

      <div className="parent" id="gameboard">
        {yourDivs}
      </div>
      <div id="resultboard" style={{ display: allDone ? 'block' : 'none' }}>
        <div className="containerResult">
          <h2>Resultat</h2>
          <h3>{result}</h3>
          <h3>{pointsCounter}% rätt</h3>
          <Progress done={pointsCounter} />
          {/* <button className="resultBtn" onClick={saveImg}>Ladda ner bild</button> */}
          <button className="resultBtn">
            <Link to="/">Spela igen</Link>
          </button>
        </div>
      </div>

      <div className="leftWrapper">
        <div id="imgsContainer">
          <img src={img1} alt="img1" />
        </div>
        <h3>{result}</h3>
        <button id="btnDone" disabled={done} onClick={donePlaying}>
          Klar
        </button>
        {/* <button id="btnDone" disabled={done} onClick={function(){donePlaying(); clearInterval(gameTime)}}>Klar</button> */}
        <button id="" disabled={start} onClick={handleClickStart}>
          Måla av{' '}
        </button>
      </div>
    </div>
  );
};

export default Game;
