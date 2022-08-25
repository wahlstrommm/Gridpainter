import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io('http://localhost:3001', {
    "autoConnect": false,
    withCredentials: true,
    extraHeaders: {
        "Gridpainter": "abcd"
    }
});

export function Chat(props) {

    const [msg, setMsg] = useState("");

    const handleChange = (e) => {
        setMsg(e.target.value);
    };

    const submitMsg = (e) => {
        socket.connect();
        e.preventDefault();
        console.log(props.userName, "Klick på Skicka", msg, props.roomName);

        socket.emit("chat", {
            userName: props.userName,
            msg: msg,
            roomName: props.roomName
        });
    };
    socket.on('chat', (msg) => {
        console.log("CHAT", msg);
    });

    return (<>
        <h1>Chat</h1>

        <div></div>

        <form>
            <input type='text' placeholder="Skicka meddelande" onChange={handleChange} />
            <button onClick={submitMsg}>Skicka</button>
        </form>
    </>);

}

export default Chat

