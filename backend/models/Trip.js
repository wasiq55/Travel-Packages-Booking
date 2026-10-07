
const mongoose = require("mongoose");

const tripTransportSchema = new mongoose.Schema(
    {
        transport: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transport",
            required: true
        },

        fromCity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "City",
            required: true
        },

        toCity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "City",
            required: true
        },

        travelers: {
            type: Number,
            default: 1,
            min: 1
        },

        amount: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        _id: true
    }
);

const tripRideSchema = new mongoose.Schema(
    {
        fromCity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "City",
            required: true
        },

        toCity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "City",
            required: true
        },

        rideType: {
            type: String,
            enum: ["bike", "auto", "cab"],
            required: true
        },

        rideName: {
            type: String,
            required: true,
            trim: true
        },

        estimatedFare: {
            type: Number,
            required: true,
            min: 0
        },

        estimatedDurationMinutes: {
            type: Number,
            required: true,
            min: 0
        },

        travelers: {
            type: Number,
            default: 1,
            min: 1
        },

        amount: {
            type: Number,
            default: 0,
            min: 0
        },

        source: {
            type: String,
            default: "mock"
        },

        isLive: {
            type: Boolean,
            default: false
        }
    },
    {
        _id: true
    }
);

const tripSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            trim: true,
            default: "My Custom Trip"
        },

        zone: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Zone",
            required: true
        },

        startDate: {
            type: Date,
            default: null
        },

        endDate: {
            type: Date,
            default: null
        },

        travelers: {
            adults: {
                type: Number,
                min: 1,
                default: 1
            },

            children: {
                type: Number,
                min: 0,
                default: 0
            },

            rooms: {
                type: Number,
                min: 1,
                default: 1
            }
        },

        transport: [tripTransportSchema],

        rideSelections: {
            type: [tripRideSchema],
            default: []
        },

        currentStep: {
            type: String,
            enum: [
                "cities",
                "places",
                "dates",
                "hotels",
                "transport",
                "activities",
                "review",
                "payment"
            ],
            default: "cities"
        },

        status: {
            type: String,
            enum: [
                "draft",
                "planning",
                "ready",
                "payment_pending",
                "confirmed",
                "completed",
                "cancelled"
            ],
            default: "draft"
        },

        subtotal: {
            type: Number,
            default: 0,
            min: 0
        },

        taxes: {
            type: Number,
            default: 0,
            min: 0
        },

        discount: {
            type: Number,
            default: 0,
            min: 0
        },

        totalAmount: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

tripSchema.index({
    user: 1,
    createdAt: -1
});

module.exports = mongoose.model("Trip", tripSchema);