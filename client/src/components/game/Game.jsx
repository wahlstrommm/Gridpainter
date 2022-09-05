import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useChatContext } from '../../context/ChatContextProvider';
// import { PostImgService } from '../../services/PostImgService';
import './game.scss';

import axios from 'axios';
import img1a from './63148270d91c31ad1a363a38.png';
import img1b from './631274fbd0dedd31d93602d0.png';
import img1c from './63146f30d91c31ad1a363a22.png';
import img1d from './6314756fd91c31ad1a363a28.png';
import img1e from './63147d73d91c31ad1a363a2e.png';

const Game = () => {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [connected, setConnected] = useState(false);
  const [color, setColor] = useState('');
  const [done, setDone] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [pointsCounter, setPointsCounter] = useState(0);
  const [watcher, setWatcher] = useState(false);
  const [player, setPlayer] = useState(false);
  const points = useRef(1);
  //timern och resultatet på gruppens tid
  const [finalTime, setFinalTime] = useState('');
  const [time, setTime] = React.useState(0);
  const [timerOn, setTimerOn] = React.useState(false);

  //grid
  const [yourDivs, setYourDivs] = useState([]);
  const { chatUsername, socket } = useChatContext();
  const { room_id } = useParams();
  const navigate = useNavigate();
  const messageRef = useRef();
  const messageEndRef = useRef(null);

  // const [img1, setImg1] = useState({});
  const img1 = useRef({});
  const rightId = useRef(Number);
  const diableBoxes = useRef(false);

  const handleIncomingMessage = (msg) => {
    console.log('Received a new chat message', msg);

    // lägger till meddelande i chatt
    setMessages((prevMessages) => [...prevMessages, msg]);
  };

  const handleUpdateUsers = (userlist, userObject) => {
    setUsers(userlist);
  };

  const handleRoomStatus = (roomStatus) => {
    console.log(roomStatus);

    if (roomStatus == 'får inte spela') {
      setWatcher(true);
    } else {
      setPlayer(true);
    }
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
  //timern
  React.useEffect(() => {
    let interval = null;

    if (timerOn) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else if (!timerOn) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timerOn]);
  let imgPic = <></>;
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

    //hanterar facit bild.
    socket.on('facitPic', (rightPic, facitBoard) => {
      img1.current = facitBoard;
      let allImg2 = ['63148270d91c31ad1a363a38', '631274fbd0dedd31d93602d0', '63146f30d91c31ad1a363a22', '6314756fd91c31ad1a363a28', '63147d73d91c31ad1a363a2e'];

      for (let i = 0; i < allImg2.length; i++) {
        if (allImg2[i] == rightPic) {
          rightId.current = i;
          console.log(rightId.current);
        }
      }
      let imgContainer = document.getElementById('imgContainer');

      if (rightId.current == 0) {
        imgContainer.src = img1a;
      }
      if (rightId.current == 1) {
        imgContainer.src = img1b;
      }
      if (rightId.current == 2) {
        imgContainer.src = img1c;
      }
      if (rightId.current == 3) {
        imgContainer.src = img1d;
      }
      if (rightId.current == 4) {
        imgContainer.src = img1e;
      }
    });
    // Lyssnar på färgade rutor
    socket.on('coloredPiece', (nr, color, socketId, state) => {
      setColor(color);
      generateYourDivs(nr, color);
    });

    //Lyssnar på gameclock timer.Vilka som är klara och när timern ska starta & sluta
    socket.on('gameClock', (roomId, userListThatPressedDone, resultTimeFromUsers) => {
      //sätter tiden för gruppen
      setFinalTime(resultTimeFromUsers);
      //När rummet fylls med fyra spelare så emitar man ut "start" och då startar timern
      if (userListThatPressedDone == 'start') {
        setTimerOn(true);
      } else {
        //Stoppas när alla har tryckt på klart
        if (userListThatPressedDone == 'stop') {
          setTimerOn(false);
        } else {
          console.log('Så många har tryckt klar:', userListThatPressedDone, finalTime);
        }
      }
    });

    socket.on('donePlaying', (text, result) => {
      points.current = Math.round(result);

      if (text === 'done') {
        setAllDone(true);
      }
    });

    return () => {
      // Slutar lyssna
      socket.off('chat:message', handleIncomingMessage);
      socket.off('roomAvailability', handleRoomStatus);
      socket.off('user:list', handleUpdateUsers);
      socket.off('coloredPiece');
      socket.off('donePlaying');
      socket.off('user:joined');
      socket.off('facitPic');
      socket.off('gameClock');
      socket.emit('user:left', chatUsername, room_id);
    };
  }, [socket, room_id, chatUsername, navigate, points]);

  // hantera klick på en ruta i griden
  const handleBoxClick = (id, socketId) => {
    socket.emit('coloredPiece', id, room_id, socketId, true);
  };

  const generateYourDivs = async (nr, color) => {
    const yourDivBoxes = [];

    if (diableBoxes.current == false) {
      for (let i = 1; i < 226; i++) {
        yourDivBoxes.push(<div className="gridBox" key={[i]} id={`box${i}`} onClick={() => handleBoxClick(i, socket.id)}></div>);

        if (nr == i) {
          document.getElementById('box' + i).style.background = color;
        }
      }

      return setYourDivs(yourDivBoxes);
    } else {
      for (let i = 1; i < 226; i++) {
        yourDivBoxes.push(<div className="gridBox" key={[i]} id={`box${i}`}></div>);
      }
      return setYourDivs(yourDivBoxes);
    }
  };
  let percent;
  let timeForCurrentUser;
  //event för klar knappen
  const donePlaying = () => {
    let children = [];
    //visar tiden dock som react element
    let timeFromUser = resultTime.props.children;
    for (let i = 0; i < timeFromUser.length; i++) {
      children.push(timeFromUser[i].props.children);
    }
    //Slår ihop de till en array istället som jag fick innan en med flera arrays.
    let merged = [].concat.apply([], children);
    timeForCurrentUser = '';
    //tar ut varje element alltifrån timme till hundradel även ":"
    for (let i = 0; i < merged.length; i++) {
      timeForCurrentUser += merged[i];
      console.log(timeForCurrentUser);
    }
    //skickar upp det för att sedan ta reda på vilken den sista som tryckte och vilken tid
    //den har som sedan blir gruppens slutgiltiga tid.
    socket.emit('gameClock', room_id, 'klar', timeForCurrentUser);
    console.log('REslut time:', resultTime.props.children);

    //id, boolean
    console.log('socketID', socket.id);
    //IF SocketID + Color etc.

    // children till YourDivs?
    console.log(yourDivs);

    let gameboard = document.getElementById('gameboard');
    let colorBoard = [];

    for (let i = 0; i < gameboard.children.length; i++) {
      let eachDiv = {
        id: gameboard.children[i].id,
        color: gameboard.children[i].style.backgroundColor,
      };
      if (eachDiv.color == '') {
        eachDiv.color = 'white';
        colorBoard.push(eachDiv);
      } else {
        colorBoard.push(eachDiv);
      }
    }

    let counter = 0;

    colorBoard.forEach((num1, index) => {
      const num2 = img1.current[index];
      console.log('colorBoard:', num1.color, 'Facit:', num2.color);

      if (num1.color === num2.color) {
        counter++;
        console.log('Rätt', counter);

        percent = (counter / 225) * 100;

        setPointsCounter(percent);
        points.current = Math.round(percent);
      } else {
        console.log('Fel');
      }
    });

    socket.emit('resultFromUser', pointsCounter);

    socket.emit('donePlaying', socket.id, room_id, points.current);

    setDone(true);
    diableBoxes.current = true;

    let players = Object.values(users);
    let date = new Date();
    let dateString = date.toLocaleString();

    axios
      .post(
        'https://gridpainter-backend.herokuapp.com/img/save',
        { colorBoard, room_id, players, dateString },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  //Progress bar. Baseras på hur mycket rätt man fick
  const Progress = ({ done }) => {
    const [style, setStyle] = React.useState({});

    setTimeout(() => {
      const newStyle = {
        opacity: 1,
        width: `${points.current}%`,
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

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  let chatMessages = messages.map((message, i) => {
    if (chatUsername === message.username) {
      console.log('Du');

      return (
        <li key={i} className="userSelf">
          <span className="chatUsername">{message.username}: </span>
          <span className="chatMessage">{message.content}</span>
        </li>
      );
    } else {
      console.log('Inte du');
      return (
        <li key={i} className="userOther">
          <span className="chatUsername">{message.username}: </span>
          <span className="chatMessage">{message.content}</span>
        </li>
      );
    }

    // return (
    //   <li key={i}>
    //     <span className="user">{message.username}: </span>
    //     <span className="content">{message.content}</span>
    //   </li>
    // );
  });

  // Ifall det inte sker en connection
  if (!connected) {
    return <p>Stand by, connecting....</p>;
  }

  let showBtn = <>Tyvärr är pennorna slut, men du får gärna titta på!</>;
  if (player) {
    showBtn = (
      <button id="btnDone" disabled={done} onClick={donePlaying}>
        Klar
      </button>
    );
  }

  //Denna används för att ta ut alla spelarnas tider (som man kan klicka på klar när man vill)
  // som sedan tar fram gruppens slutgiltiga tid.
  let resultTime = <>Hej</>;
  if (time) {
    resultTime = (
      <div id="display">
        <span>{('0' + Math.floor((time / 60000) % 60)).slice(-2)}:</span>
        <span>{('0' + Math.floor((time / 1000) % 60)).slice(-2)}:</span>
        <span>{('0' + ((time / 10) % 100)).slice(-2)}</span>
      </div>
    );
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
          <hr />
        </div>

        <div>
          <ul>
            {/* {messages.map((message, i) => (
              <li key={i}>
                <span className="user">{message.username}: </span>
                <span className="content">{message.content}</span>
              </li>
            ))} */}
            {chatMessages}
            <div ref={messageEndRef} />
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
          <h3>{points.current}% rätt</h3>
          <h3>{finalTime}</h3>
          <Progress done={points.current} />
          <button className="resultBtn">
            <Link to="/">Spela igen</Link>
          </button>
        </div>
      </div>

      <div className="leftWrapper">
        <div>
          <img id="imgContainer" src="" alt="" />
        </div>
        <div id="display">
          <span>{('0' + Math.floor((time / 60000) % 60)).slice(-2)}:</span>
          <span>{('0' + Math.floor((time / 1000) % 60)).slice(-2)}:</span>
          <span>{('0' + ((time / 10) % 100)).slice(-2)}</span>
        </div>
        <h3>{result}</h3>
        <div className="containerForViewer">{showBtn}</div>
      </div>
    </div>
  );
};

export default Game;
