import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io('http://localhost:3001', {"autoConnect": false});

export function Start() {

    
    
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        socket.on("connect", () => {
            setIsConnected(true);
            console.log("Hej från socket")
        })
    }, [socket]);

    

    const handleConnect = () => {
        socket.connect()

        socket.on("connect", () => {
        setIsConnected(true);
        console.log("Hej från socket")
    })
    }

    return (<>
        <button onClick={handleConnect} >test</button>
        <h1>Start</h1>
        
    </>)
}