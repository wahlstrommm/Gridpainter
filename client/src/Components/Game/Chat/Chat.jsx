import { useState, useEffect } from "react";
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


    useEffect(() => {
        console.log("Från useEffect");
    }, [msg]);


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

    socket.on('chat', (t) => {
        console.log("CHAT",t );
    });
    socket.on('chat2', (e) => {
        console.log("CHAT2", e);
    });
    
    let chatMsg = <>
    </>
    if (msg) {
        <p> {msg} </p>
    }

    return (<>
        <h1>Chat</h1>

        <div>
           {chatMsg} 
        </div>

        <form>
            <input type='text' placeholder="Skicka meddelande" onChange={handleChange} />
            <button onClick={submitMsg}>Skicka</button>
        </form>
    </>);

}

export default Chat

