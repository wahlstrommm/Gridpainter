import { createContext, useContext, useState } from "react";
import socketio from "socket.io-client";

const ChatContext = createContext();
const socket = socketio.connect(process.env.REACT_APP_SOCKET_URL);

export const useChatContext = () => {
  return useContext(ChatContext);
};

const ChatContextProvider = ({ children }) => {
  const [chatUsername, setChatUsername] = useState();

  const values = {
    chatUsername,
    setChatUsername,
    socket,
  };

  return <ChatContext.Provider value={values}>{children}</ChatContext.Provider>;
};

export default ChatContextProvider;
