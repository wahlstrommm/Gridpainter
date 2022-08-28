import React from "react";
import { Link } from "react-router-dom";
import "./gallery.scss";

const Gallery = () => {
  return <section>
    <h1>Galleri</h1>
    <div>
      <img src="" alt="Text" />
      <img src="" alt="Text" />
      <img src="" alt="Text" />
      <img src="" alt="Text" />
      <img src="" alt="Text" />
      <img src="" alt="Text" />
    </div>
    <button className="startBtn"><Link to='/'>Tillbaka</Link></button>
  </section>;
};

export default Gallery;