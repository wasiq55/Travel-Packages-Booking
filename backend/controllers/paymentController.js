require("dotenv").config();
const crypto = require("crypto");
const Razorpay = require("razorpay");

const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Trip = require("../models/Trip");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


const createPaymentOrder = async (req, res) => {
    try {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            console.error("Razorpay environment variables are missing");

            return res.status(500).json({
                success: false,
                message: "Razorpay is not configured on the server"
            });
        }

        const booking = await Booking.findOne({
            _id: req.params.bookingId,
            user: req.user._id
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (booking.paymentStatus === "paid") {
            return res.status(400).json({
                success: false,
                message: "Booking is already paid"
            });
        }

        const amount = Math.round(Number(booking.totalAmount) * 100);

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Booking amount is invalid"
            });
        }

        const razorpayClient = new Razorpay({
            key_id: keyId,
            key_secret: keySecret
        });

        const order = await razorpayClient.orders.create({
            amount,
            currency: "INR",
            receipt: booking.bookingNumber
        });

        const payment = await Payment.create({
            user: req.user._id,
            booking: booking._id,
            amount: booking.totalAmount,
            currency: "INR",
            provider: "razorpay",
            orderId: order.id,
            status: "created"
        });

        booking.paymentStatus = "processing";
        await booking.save();

        return res.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency
            },
            paymentId: payment._id,
            key: keyId
        });
    } catch (error) {
        console.error("CREATE PAYMENT ORDER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create payment order"
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Payment verification data is incomplete"
            });
        }

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    razorpay_order_id +
                    "|" +
                    razorpay_payment_id
                )
                .digest("hex");

        if (
            generatedSignature !==
            razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid payment signature"
            });
        }

        const payment =
            await Payment.findOne({
                orderId: razorpay_order_id,
                user: req.user._id
            });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message:
                    "Payment record not found"
            });
        }

        if (payment.status === "paid") {
            return res.json({
                success: true,
                message:
                    "Payment already verified",
                payment
            });
        }

        payment.paymentId =
            razorpay_payment_id;

        payment.signature =
            razorpay_signature;

        payment.status = "paid";

        await payment.save();

        const booking =
            await Booking.findOne({
                _id: payment.booking,
                user: req.user._id
            });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        booking.paymentStatus = "paid";
        booking.bookingStatus = "confirmed";

        await booking.save();

        if (
            booking.bookingType === "trip" &&
            booking.trip
        ) {
            const trip =
                await Trip.findById(
                    booking.trip
                );

            if (trip) {
                trip.status = "confirmed";
                trip.currentStep = "payment";

                await trip.save();
            }
        }

        return res.json({
            success: true,
            message:
                "Payment verified successfully",
            booking
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment
};