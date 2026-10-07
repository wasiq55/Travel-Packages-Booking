const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        city: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "City",
            required: true
        },
        description: {
            type: String
        },
        address: {
            type: String,
            required: true
        },
        phone: {
            type: String
        },
        email: {
            type: String
        },
        images: [
            {
                type: String
            }
        ],
        amenities: [
            {
                type: String
            }
        ],
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        checkInTime: {
            type: String,
            default: "12:00"
        },
        checkOutTime: {
            type: String,
            default: "11:00"
        },
        isApproved: {
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

module.exports = mongoose.model("Hotel", hotelSchema);