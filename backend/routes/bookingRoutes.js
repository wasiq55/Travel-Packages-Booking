const express = require("express");

const router = express.Router();

const {
    protect
} = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

const {
    createBooking,
    createHotelBooking,
    getMyBookings,
    getBooking
} = require("../controllers/bookingController");

router.use(
    protect,
    authorize("user")
);

router.post(
    "/trip/:tripId",
    createBooking
);

router.post(
    "/hotel",
    createHotelBooking
);

router.get(
    "/my-bookings",
    getMyBookings
);

router.get(
    "/:bookingId",
    getBooking
);

module.exports = router;