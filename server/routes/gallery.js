const express = require("express");
const router = express.Router();
const cors = require("cors");
const server = require("../server");

router.use(cors());

require("dotenv").config();

router.get("/", async (req, res) => {});

router.post("/", async (req, res) => {});

module.exports = router;
