
const express = require("express");

const {
    protect
} = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

const {
    getCities,
    getCitiesByState,
    getCityPlaces,
    updateCityLocation
} = require("../controllers/cityController");

const router = express.Router();

router.get("/", getCities);

router.get("/state/:stateId", getCitiesByState);

router.patch(
    "/:cityId/location",
    protect,
    authorize("admin"),
    updateCityLocation
);

router.get("/:cityId/places", getCityPlaces);

module.exports = router;