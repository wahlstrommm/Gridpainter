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
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [msg, setMsg] = useState("");
    const [sentMsg, setSentMsg] = useState({ userName: "", msg: "" });

    useEffect(() => {
        socket.on("connection", () => {
            console.log("true", isConnected);
            setIsConnected(true);
        });
        socket.on('disconnect', () => {
            console.log("FALSE", isConnected);

            setIsConnected(false);
        });
        socket.on('chatA', (userName, msg) => {
            setIsConnected(false);
            console.log("CHAT", userName, msg);
            setSentMsg({ userName: userName, msg: msg });
        })
              
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('CHAT')
        };
    }, []);

    const handleChange = (e) => {
        setMsg(e.target.value);
    };

    const printHtml = (userName, msg) => {
        setSentMsg({ userName: userName, msg: msg });
        let msgText = document.createElement('p');
        msgText.innerText = sentMsg.userName + ": " + sentMsg.msg;
        let chatContainer = document.getElementById('chatContainer');
        chatContainer.append(msgText);

    };

    const submitMsg = (e) => {
        socket.connect();
        e.preventDefault();
        console.log(props.userInfo.userName, props.userInfo.roomName, "Klick på Skicka", msg);

        //Props username och roomName kommer från Start-komponenten och ska användas i komponenten Games och chat
        socket.emit("chat",
            props.userInfo.userName,
            msg,
            props.userInfo.roomName
        );
        // socket.on('chatA', (userName, msg) => {
        //     console.log("CHAT", userName, msg);
        //     printHtml(userName, msg);
        // });

    };



    return (<>
        <section>
            {sentMsg.userName}{sentMsg.msg}
            <div id='chatContainer'></div>
            <form>
                <input type='text' placeholder="Skicka meddelande" onChange={handleChange} />
                <button onClick={submitMsg}>Skicka</button>
            </form>

        </section>
    </>);

}

export default Chat;
