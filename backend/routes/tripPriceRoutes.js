const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");


console.log("protect:", typeof protect);
console.log("authorize:", typeof authorize);
console.log("authorize result:", typeof authorize("user"));

const {
    calculateTripPrice
} = require("../controllers/tripPriceController");

router.use(protect, authorize("user"));

router.post(
    "/:tripId/calculate",
    calculateTripPrice
);

module.exports = router;