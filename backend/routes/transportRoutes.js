
const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    getTransport,
    createTransport,
    selectTransport,
    removeTransport,
    getRideEstimate
} = require("../controllers/transportController");

router.get("/", getTransport);

router.post(
    "/",
    protect,
    authorize("admin"),
    createTransport
);

router.post(
    "/ola/estimate",
    protect,
    authorize("user"),
    getRideEstimate
);

router.post(
    "/trip/:tripId",
    protect,
    authorize("user"),
    selectTransport
);

router.delete(
    "/trip/:tripId/:transportId",
    protect,
    authorize("user"),
    removeTransport
);

module.exports = router;