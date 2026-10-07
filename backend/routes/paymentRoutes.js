const express = require("express");

const router = express.Router();

const {
    protect
} = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

const {
    createPaymentOrder,
    verifyPayment
} = require("../controllers/paymentController");

router.use(
    protect,
    authorize("user")
);

router.post(
    "/create-order/:bookingId",
    createPaymentOrder
);

router.post(
    "/verify",
    verifyPayment
);

module.exports = router;