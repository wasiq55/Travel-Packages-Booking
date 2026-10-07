const express = require("express");

const {
  createHotel,
  getMyHotel,
  updateMyHotel,
  getApprovedHotels,
  getHotelById,
  getAllHotelsForAdmin,
  approveHotel,
  rejectHotel
} = require("../controllers/hotelController");

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("admin", "hotel"),
  createHotel
);

router.get(
  "/my-hotel",
  protect,
  authorize("hotel"),
  getMyHotel
);

router.put(
  "/my-hotel",
  protect,
  authorize("hotel"),
  updateMyHotel
);

router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  getAllHotelsForAdmin
);

router.put(
  "/admin/:hotelId/approve",
  protect,
  authorize("admin"),
  approveHotel
);

router.put(
  "/admin/:hotelId/reject",
  protect,
  authorize("admin"),
  rejectHotel
);

router.get(
  "/",
  getApprovedHotels
);

router.get(
  "/:hotelId",
  getHotelById
);

module.exports = router;