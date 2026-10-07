const express = require("express");
const {
    getZones,
    getZoneStates
} = require("../controllers/zoneController");

const router = express.Router();

router.get("/", getZones);
router.get("/:zoneId/states", getZoneStates);

module.exports = router;