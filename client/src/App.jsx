// import "./App.scss";
import { Routes, Route } from "react-router-dom";
import Gallery from "./components/gallery/Gallery";
import Game from "./components/game/Game";
import Start from "./components/start/Start";

function App() {
  return (
    <div id="App">
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/game/:room_id" element={<Game />} />
        <Route path="/gallery" element={<Gallery />} />
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </div>
  );
}

export default App;
