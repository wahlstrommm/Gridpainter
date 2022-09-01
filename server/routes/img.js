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

router.get('/imgs', (req, res) => { 
    req.app.locals.db.collection("Imgs").find().toArray().then(result => {
        res.send(result);
        console.log(result);
    }).catch(err => {
        res.send(err);
        console.log(err);
    });
})

let counter = 0;

// Post en bild
router.post("/save", async (req, res) => {
    console.log(req.body.players);
    counter++;

    // Kontrollerar att två personer har klickat på start
    // för att inte spara två gånger
    if (counter == 2 && req.body.room_id === req.body.room_id) {
        req.app.locals.db.collection("Gallery").insert({ img: req.body.colorBoard, roomId: req.body.room_id, players: req.body.players, date: req.body.dateString }).then(
            result => {
                console.log("One image added", result);
                // res.redirect('/show');
                res.json(result);
            }
        );
        counter = 0;
    }
});

// router.post('/', (res, req) => {
//     req.app.locals.db.collection("Imgs").insert({ img: req.body.img }).then(
//         result => {
//             console.log("One image added", result);
//             // res.redirect('/show');
//             res.json(result);
//         }
//     );
// });



// router.get('/', (res, req) => {
//     console.log(res.body);
//     console.log(req.body);
// });

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



