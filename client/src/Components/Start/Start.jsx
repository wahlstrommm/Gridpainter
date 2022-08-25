import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import io from "socket.io-client";
import { Game } from "../Game/Game";

const socket = io('http://localhost:3001', {
    "autoConnect": false,
    withCredentials: true,
    extraHeaders: {
        "Gridpainter": "abcd"
    }
});

export function Start() {

    const [isConnected, setIsConnected] = useState(socket.connected);
    const [userInfo, setUserInfo] = useState({ userName: "", roomName: "" });
    const [showGamePage, setShowGamePage] = useState(false);
    const [hiddenStartPage, setHiddenStartPage] = useState(false);
    const [errorMessage,setErrorMessage] = useState("");

    useEffect(() => {
        socket.on("connect", () => {
            setIsConnected(true);
            console.log("Hej från socket");
            console.log(isConnected);
        });
    }, [isConnected]);


    const handleChange = (e) => {
        let name = e.target.name;
        setUserInfo({ ...userInfo, [name]: e.target.value });
        console.log(userInfo);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        socket.connect();
        socket.emit("userInfo", userInfo);

        socket.on('roomStatus', (msg) => {
            if (msg === 'created' || msg === 'joined') {
                setShowGamePage(true);
                setHiddenStartPage(true);
            } else if (msg === 'full') {
                setShowGamePage(false);
                setErrorMessage("Room is full");
            }
        });
    };

    return (<>
        {!hiddenStartPage ? <section>
            <h1>Hej välkommen till vårt spel hihi</h1>

            <form onSubmit={handleSubmit}>
                <label>Användarnamn</label>
                <input type="text" name='userName' value={userInfo.userName} id="name" placeholder="Enter your name" onChange={handleChange} />
                <input type="text" name='roomName' value={userInfo.roomName} placeholder="Enter room" onChange={handleChange} />
                <input type="submit" value="Submit" />
            </form>
            {errorMessage && <p>{errorMessage}</p>}
        </section> : null}
        {/* {showGamePage ? <Link to="/game">Välkommen till spelet</Link> : null} */}

        {showGamePage ? <Game props={userInfo} /> : null}
    </>);
}