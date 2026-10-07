const express = require("express");
const {
    getStates,
    getStateCities
} = require("../controllers/stateController");

const router = express.Router();

router.get("/", getStates);
router.get("/:stateId/cities", getStateCities);

module.exports = router;