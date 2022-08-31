
const express = require("express");
const router = express.Router();
const cors = require("cors");
const server = require("../server");

router.use(cors());

require("dotenv").config();

router.get("/", async (req, res) => {
    console.log("res from gallery:", res);
    res.send("Hello World");
});

router.post("/", async (req, res) => {
    try {
        const img = await server.imgModel.create(
            { room: 'room1', player: ['player1', 'player2'], img: [{ x: 1, y: 1 }, { x: 2, y: 2 }] });
        res.json(img);
    } catch (err) {
        res.json(err);
    }
});

module.exports = router;