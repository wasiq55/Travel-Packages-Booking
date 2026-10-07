
const express = require("express");

const {
    addFoodPackage,
    getMyFoodPackages,
    updateFoodPackage,
    deleteFoodPackage,
    getHotelFoodPackages
} = require("../controllers/foodController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("hotel"),
    addFoodPackage
);

router.get(
    "/my-food",
    protect,
    authorize("hotel"),
    getMyFoodPackages
);

router.put(
    "/:foodId",
    protect,
    authorize("hotel"),
    updateFoodPackage
);

router.delete(
    "/:foodId",
    protect,
    authorize("hotel"),
    deleteFoodPackage
);

router.get(
    "/hotel/:hotelId",
    getHotelFoodPackages
);

router.post(
    "/admin",
    protect,
    authorize("admin"),
    addFoodPackage
);

module.exports = router;