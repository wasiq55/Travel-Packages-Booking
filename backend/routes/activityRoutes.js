const express = require("express");

const router = express.Router();

const {
    protect
} = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

const {
    getActivities,
    createActivity,
    addActivityToTrip,
    removeActivityFromTrip
} = require("../controllers/activityController");

router.get(
    "/",
    getActivities
);

router.post(
    "/",
    protect,
    authorize("admin"),
    createActivity
);

router.post(
    "/trip/:tripId/cities/:tripCityId",
    protect,
    authorize("user"),
    addActivityToTrip
);

router.delete(
    "/trip/:tripId/cities/:tripCityId/:activityId",
    protect,
    authorize("user"),
    removeActivityFromTrip
);

module.exports = router;