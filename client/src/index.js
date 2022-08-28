import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import { BrowserRouter } from "react-router-dom";
import ChatContextProvider from "./context/ChatContextProvider";
import App from "./App";


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Wrappar app i context så vi får tag i den överallt */}
      <ChatContextProvider>
        <App />
      </ChatContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
