import { useState, useEffect } from "react";
import io from "socket.io-client";
import { Game } from "../Game/Game";
import "./start.css";

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
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        socket.on("connection", () => {
            setIsConnected(true);
            console.log("true", isConnected);

        });
        socket.on('disconnect', () => {
            setIsConnected(false);
            console.log("FALSE", isConnected);

        });
        //Borde denna också vara inbakad i en UseEffect eller kan den ligga som den är eftersom den ligger inuti en handleSubmit?
        socket.on('roomStatus', (roomStatus) => {
            if (roomStatus === 'created' || roomStatus === 'joined') {
                setShowGamePage(true);
                setHiddenStartPage(true);
                // socket.off('roomStatus');
                setIsConnected(false);
                console.log(socket);
                console.log("FALSE2", isConnected, socket.connected);
                                
            } else if (roomStatus === 'full') {
                setShowGamePage(false);
                setErrorMessage("Room is full");
            }
        });
        return () => {
            socket.off('connection');
            socket.off('disconnect');
            socket.off('roomStatus');
        };
    }, []);

    const handleChange = (e) => {
        let name = e.target.name;
        setUserInfo({ ...userInfo, [name]: e.target.value });
        // console.log(userInfo);
    };

    const handleSubmit = (e) => {
        socket.connect();
        e.preventDefault();
        socket.emit("userInfo", userInfo);

    };

    return (<>
        {!hiddenStartPage ? <section className="startSection">
            <h1 className="h1Start">Hej välkommen till vårt spel hihi</h1>

            <form className="userForm" onSubmit={handleSubmit}>
                <label>Användarnamn</label>
                <input className="userInput" type="text" name='userName' value={userInfo.userName} id="name" placeholder="Enter your name" onChange={handleChange} />
                <input className="userInput" type="text" name='roomName' value={userInfo.roomName} placeholder="Enter room" onChange={handleChange} />
                <input className="playBtn" type="submit" value="Submit" />
            </form>
            {errorMessage && <p>{errorMessage}</p>}

            <button className="galleryBtn">Galleri</button>
        </section> : null}

        {showGamePage ? <Game props={userInfo} /> : null}
    </>);
}