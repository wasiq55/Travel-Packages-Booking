const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        trip: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Trip",
            required: false
        },

        hotel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hotel",
            required: false
        },

        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: false
        },

        bookingType: {
            type: String,
            enum: ["trip", "hotel"],
            default: "trip"
        },

        bookingNumber: {
            type: String,
            required: true,
            unique: true
        },

        travelers: {
            adults: {
                type: Number,
                required: true
            },

            children: {
                type: Number,
                default: 0
            },

            rooms: {
                type: Number,
                default: 1
            }
        },

        guestDetails: {
            firstName: {
                type: String,
                trim: true
            },

            lastName: {
                type: String,
                trim: true
            },

            email: {
                type: String,
                trim: true
            },

            phone: {
                type: String,
                trim: true
            }
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            required: true
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        bookingStatus: {
            type: String,
            enum: [
                "pending",
                "payment_pending",
                "confirmed",
                "cancelled",
                "completed"
            ],
            default: "pending"
        },

        paymentStatus: {
            type: String,
            enum: [
                "unpaid",
                "processing",
                "paid",
                "failed",
                "refunded"
            ],
            default: "unpaid"
        }
    },
    {
        timestamps: true
    }
);

bookingSchema.index({
    user: 1,
    createdAt: -1
});

bookingSchema.index({
    hotel: 1,
    room: 1,
    startDate: 1,
    endDate: 1
});

module.exports = mongoose.model(
    "Booking",
    bookingSchema
);