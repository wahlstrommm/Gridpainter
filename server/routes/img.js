const express = require("express");
const router = express.Router();
const cors = require("cors");

router.use(cors());

require("dotenv").config();

// Hämta listan med bilder
router.get("/", async (req, res) => {

    req.app.locals.db.collection("Gallery").find().toArray().then(result => {
        res.send(result);
        console.log(result);
    }).catch(err => {
        res.send(err);
        console.log(err);
    }); 
});

let counter = 0;

// Post en bild
router.post("/save", async (req, res) => {
    console.log(req.body);
    counter++;

    // Kontrollerar att två personer har klickat på start
    // för att inte spara två gånger
    if (counter == 2 && req.body.room_id === req.body.room_id) {
        req.app.locals.db.collection("Gallery").insert({ img: req.body.colorBoard, roomId: req.body.room_id }).then(
            result => {
                console.log("One image added", result);
                // res.redirect('/show');
                res.json(result);
            }
        );
        counter = 0;
    }
});

// router.delete("/", async (req, res) => {

//     req.app.locals.db.collection('Gallery').deleteMany({}).then(
//         result => {
//             console.log("All images deleted", result);
//             // res.redirect('/show');
//             res.json(result);
//         }
//     );
// })

module.exports = router;



