import { useEffect, useState } from "react";
import io from "socket.io-client";
import Chat from "./Chat/Chat";
import "./game.css"

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
        <div className="pageWrapper">
            <div className="leftSideWrapper">
                <section className="gameInfo">
                    <h1>Game</h1>
                    <p>{props.props.userName}</p>
                    <p>{props.props.roomName}</p>
                </section>

                <section className="chatSection">
                    <Chat userName={{ "userName": props.props.userName, "roomName": props.props.roomName }} />
                </section>
            </div>

            <div className="gameboardWrapper">
                <section className="gameboardSection">Gameboard</section>
            </div>

            <div className="resultboardWrapper">
                <section className="resultboardSection">Resultboard</section>
            </div>
            
        </div>
    </>);
}