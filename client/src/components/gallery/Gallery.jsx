import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./gallery.scss";
import axios from "axios";

const Gallery = () => {
  const effectRan = useRef(false);

  // const [images, setImages] = useState([]);

  useEffect(() => {
    console.log('effect ran');

    if (effectRan.current === false) {
      const fetchImages = () => {
        axios.get("http://localhost:4000/img")
          .then(res => {
            console.log("Hej från axios, get img", res.data);
            for (let i = 0; i < res.data.length; i++) {
              let parent = document.getElementById("parent");

              let gridContainer = document.createElement("div");
              let imgInfo = document.createElement("div");
              imgInfo.className = "imgInfo";
              imgInfo.innerText = `Spelare: ${res.data[i].players} ${res.data[i].date} ${res.data[i].roomId}`;
              gridContainer.className = "gridContainer";
              res.data[i].img.forEach(el => {
                let grid = document.createElement('div');
                grid.id = el.id;
                grid.className = "eachGridbox";
                grid.style.backgroundColor = el.color;
                gridContainer.append(grid);

              });
              parent.append(gridContainer, imgInfo);
            }
          });
      };
      fetchImages();
    }

    return () => {
      console.log("Gallery component unmount");
      effectRan.current = true;
    };
  }, []);

  return <section>
    <h1>Galleri</h1>

    <div className="parentGallery" id="parent">
    </div>
    <button className="startBtn"><Link to='/'>Tillbaka</Link></button>

  </section >;
};

export default Gallery;