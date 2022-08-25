import "./App.scss";
import { Start } from "./Components/Start/Start";

// import io from "socket.io-client";
// import { useEffect } from "react";

// const socket = io.connect("http://localhost:3001");
import { useEffect, useState } from "react";

// const [userInfo, setUserInfo] = useState([]);

function App() {




  return (
    <>
      <div>
        <Start />
      </div>
    </>
  );
}

export default App;
