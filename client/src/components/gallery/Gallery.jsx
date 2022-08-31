import React from "react";
import { Link } from "react-router-dom";
import "./gallery.scss";
import axios from "axios";

const Gallery = () => {

  axios.get("http://localhost:4000/img")
  .then(res => {
    console.log("Hej från axios, get img", res.data);

    for (let i = 0; i < res.data.length; i++) {
      console.log(res.data[i]._id);
      console.log(res.data[i].img);
    }

    console.log(res.data);
  })

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