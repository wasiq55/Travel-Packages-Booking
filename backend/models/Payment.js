const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        currency: {
            type: String,
            default: "INR"
        },

        provider: {
            type: String,
            enum: ["razorpay"],
            default: "razorpay"
        },

        orderId: {
            type: String
        },

        paymentId: {
            type: String
        },

        signature: {
            type: String
        },

        status: {
            type: String,
            enum: [
                "created",
                "processing",
                "paid",
                "failed",
                "refunded"
            ],
            default: "created"
        }
    },
    {
        timestamps: true
    }
);

paymentSchema.index({
    booking: 1
});

module.exports = mongoose.model(
    "Payment",
    paymentSchema
);