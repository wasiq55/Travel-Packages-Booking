const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        city: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "City",
            required: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        image: {
            type: String,
            required: false,
            trim: true,
            default: ""
        },

        entryFee: {
            type: Number,
            default: 0,
            min: 0
        },

        visitingHours: {
            type: String,
            default: "Check before visiting"
        },

        bestTimeToVisit: {
            type: String,
            default: "Throughout the year"
        },

        latitude: {
            type: Number
        },

        longitude: {
            type: Number
        },

        isPopular: {
            type: Boolean,
            default: false
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

placeSchema.index(
    { city: 1, name: 1 },
    { unique: true }
);

module.exports = mongoose.model("Place", placeSchema);