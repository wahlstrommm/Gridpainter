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
    const [userName, setUserName] = useState("");
    const [roomName, setRoomName] = useState("");
    const [test, setTest] = useState({ userName: "", roomName: "" });

    useEffect(() => {
        socket.on("connect", () => {
            setIsConnected(true);
            console.log("Hej från socket");
            console.log(isConnected);
        });
    }, [isConnected]);


    const handleChange = (e) => {
        let name = e.target.name;
        console.log(name);
        setTest({ ...test, [name]: e.target.value });
        console.log(test);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        socket.connect();
        socket.emit( "msg", test );
    };

    return (<>
        <section>
            <h1>Hej välkommen till vårt spel hihi</h1>

            <form onSubmit={handleSubmit}>
                <label>Användarnamn</label>
                <input type="text" name='userName' value={test.userName} id="name" placeholder="Enter your name" onChange={handleChange} />
                <input type="text" name='roomName' value={test.roomName} placeholder="Enter room" onChange={handleChange} />

                <input type="submit" value="Submit" />

                {/* <> 
                    <input key="field1" name="field1" onChange={({target}) => setInputs(state => ({...state,field1:target.value}))} value={inputs.field1}/>
                    <input key="field2" name="field2" onChange={({target}) => setInputs(state => ({...state,field2:target.value}))} value={inputs.field2}/>
                </> */}

            </form>
        </section>
    </>);
}