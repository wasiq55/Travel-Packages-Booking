const express = require("express");

const {
    getPendingHotels,
    getAllHotels,
    approveHotel,
    rejectHotel,
    deactivateHotel,
    activateHotel
} = require("../controllers/adminHotelController");

const {
    protect
} = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(
    protect,
    authorize("admin")
);

router.get(
    "/pending",
    getPendingHotels
);

router.get(
    "/",
    getAllHotels
);

router.patch(
    "/:hotelId/approve",
    approveHotel
);

router.patch(
    "/:hotelId/reject",
    rejectHotel
);

router.patch(
    "/:hotelId/deactivate",
    deactivateHotel
);

router.patch(
    "/:hotelId/activate",
    activateHotel
);

module.exports = router;