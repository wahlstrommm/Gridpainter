import "./App.scss";
import { Routes, Route } from "react-router-dom";
import { Gallery } from "./Components/Gallery/Gallery";
import { Game } from "./Components/Game/Game";
import Start from "./Components/Start/Start";

function App() {
  return (
    <div id="App">
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/game" element={<Game />} />
        <Route path="/gallery" element={<Gallery />} />
        {/* </Route> */}
      </Routes>
    </div>
  );
}

export default App;
