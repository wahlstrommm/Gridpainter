import { useState, useEffect } from "react";
import io from "socket.io-client";

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
            console.log(msg);
        });
    };

    return (<>
        <section>
            <h1>Hej välkommen till vårt spel hihi</h1>

            <form onSubmit={handleSubmit}>
                <label>Användarnamn</label>
                <input type="text" name='userName' value={userInfo.userName} id="name" placeholder="Enter your name" onChange={handleChange} />
                <input type="text" name='roomName' value={userInfo.roomName} placeholder="Enter room" onChange={handleChange} />
                <input type="submit" value="Submit" />
            </form>
        </section>
    </>);
}