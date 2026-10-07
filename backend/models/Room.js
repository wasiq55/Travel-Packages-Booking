const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
    {
        hotel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hotel",
            required: true
        },
        roomNumber: {
            type: String,
            required: true
        },
        roomType: {
            type: String,
            enum: [
                "standard",
                "deluxe",
                "suite",
                "family"
            ],
            required: true
        },
        pricePerNight: {
            type: Number,
            required: true,
            min: 0
        },
        maxGuests: {
            type: Number,
            required: true,
            min: 1
        },
        amenities: [
            {
                type: String
            }
        ],
        images: [
            {
                type: String
            }
        ],
        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

roomSchema.index(
    { hotel: 1, roomNumber: 1 },
    { unique: true }
);

module.exports = mongoose.model("Room", roomSchema);