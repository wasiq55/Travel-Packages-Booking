const express = require("express");

const {
    addRoom,
    getMyRooms,
    updateRoom,
    deleteRoom,
    getHotelRooms
} = require("../controllers/roomController");

const {
    protect
} = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("hotel"),
    addRoom
);

router.get(
    "/my-rooms",
    protect,
    authorize("hotel"),
    getMyRooms
);

router.put(
    "/:roomId",
    protect,
    authorize("hotel"),
    updateRoom
);

router.delete(
    "/:roomId",
    protect,
    authorize("hotel"),
    deleteRoom
);

router.get(
    "/hotel/:hotelId",
    getHotelRooms
);

router.post(
    "/admin",
    protect,
    authorize("admin"),
    addRoom
);

module.exports = router;