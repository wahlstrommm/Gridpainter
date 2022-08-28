// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { useChatContext } from "../../../context/ChatContextProvider";

// const Chat = () => {
//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [connected, setConnected] = useState(false);
//   const { chatUsername, socket } = useChatContext();
//   const { room_id } = useParams();
//   const navigate = useNavigate();
//   const messageRef = useRef();

//   const handleIncomingMessage = (msg) => {
//     console.log("Received a new chat message", msg);

//     // add message to chat
//     setMessages((prevMessages) => [...prevMessages, msg]);
//   };

//   const handleUpdateUsers = (userlist) => {
//     console.log("Got new userlist", userlist);
//     setUsers(userlist);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!message.length) {
//       return;
//     }

//     // construct message object
//     const msg = {
//       username: chatUsername,
//       room: room_id,
//       content: message,
//       timestamp: Date.now(),
//     };

//     // emit chat message
//     socket.emit("chat:message", msg);

//     // add message to chat
//     setMessages((prevMessages) => [...prevMessages, { ...msg, self: true }]);

//     // clear message input and refocus on input element
//     setMessage("");
//     messageRef.current.focus();
//   };

//   useEffect(() => {
//     // if no username, redirect them to the login page
//     if (!chatUsername) {
//       navigate("/");
//       return;
//     }

//     // emit join request
//     socket.emit("user:joined", chatUsername, room_id, (status) => {
//       console.log(`Successfully joined ${room_id} as ${chatUsername}`, status);
//       setConnected(true);
//     });

//     // listen for incoming messages
//     socket.on("chat:message", handleIncomingMessage);

//     // listen for updated userlist
//     socket.on("user:list", handleUpdateUsers);

//     return () => {
//       //   console.log("Running cleanup");

//       //   // stop listening to events
//       //   socket.off("chat:message", handleIncomingMessage);
//       //   socket.off("user:list", handleUpdateUsers);

//       // rage-quit
//       socket.emit("user:left", chatUsername, room_id);
//     };
//   }, [socket, room_id, chatUsername, navigate]);

//   // useEffect(() => {
//   // 	// focus on message input
//   // 	messageRef.current && messageRef.current.focus()
//   // }, [])

//   if (!connected) {
//     return <p>Stand by, connecting....</p>;
//   }

//   return <div>Chat</div>;
// };

// export default Chat;
