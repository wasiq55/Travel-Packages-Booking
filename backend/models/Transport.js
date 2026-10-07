const mongoose = require("mongoose");

const transportSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum: ["flight", "train", "bus", "cab", "car"],
            required: true
        },

        provider: {
            type: String,
            trim: true
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

        pricePerPerson: {
            type: Number,
            required: true,
            min: 0
        },

        duration: {
            type: String,
            trim: true
        },

        departureTime: {
            type: String
        },

        arrivalTime: {
            type: String
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

module.exports = mongoose.model("Transport", transportSchema);