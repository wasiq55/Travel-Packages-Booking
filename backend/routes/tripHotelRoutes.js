const express = require("express");

const router = express.Router();

const {
    protect
} = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

const {
    selectHotel,
    removeHotel
} = require("../controllers/tripHotelController");

router.use(
    protect,
    authorize("user")
);

router.put(
    "/:tripId/cities/:tripCityId/hotel",
    selectHotel
);

router.delete(
    "/:tripId/cities/:tripCityId/hotel",
    removeHotel
);

module.exports = router;