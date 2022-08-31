const express = require("express");
const router = express.Router();
const cors = require("cors");

router.use(cors());

require("dotenv").config();

router.get("/", async (req, res) => {

    res.send("Hello from img");
});

let counter = 0;

router.post("/save", async (req, res) => {
    console.log(req.body);
    counter++;

    if (counter == 2) {
        req.app.locals.db.collection("Gallery").insert({ img: req.body }).then(
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



