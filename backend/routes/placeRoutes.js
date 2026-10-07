const express = require("express");
const {
    getPlaces
} = require("../controllers/placeController");

const router = express.Router();

router.get("/", getPlaces);

module.exports = router;