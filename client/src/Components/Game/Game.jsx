import { useEffect, useState } from "react";
import io from "socket.io-client";
import Chat from "./Chat/Chat";

const socket = io('http://localhost:3001', {
    "autoConnect": false,
    withCredentials: true,
    extraHeaders: {
        "Gridpainter": "abcd"
    }
});
export function Game(props) {

    const [usersName, setUsersName] = useState('');


    
    useEffect(() => {
        
        socket.connect();
        socket.on('users', (users) => {
            // setUsersName(...usersName, users);
            setUsersName(users);
            // console.log("i socket",usersName);
            console.log(users);
        });

        // console.log("utanför socket", usersName)
    }, []);

    return (<>
        <h1>Game</h1>
        <p>{props.props.userName}</p>
        <p>{props.props.roomName}</p>

        <Chat userName={{ "userName": props.props.userName, "roomName": props.props.roomName }} />
    </>);
}