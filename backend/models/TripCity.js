
const mongoose = require("mongoose");

const tripPlaceSchema = new mongoose.Schema(
    {
        place: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Place",
            required: true
        },
        visitDate: {
            type: Date,
            default: null
        },
        notes: {
            type: String,
            trim: true
        }
    },
    {
        _id: true
    }
);

const tripActivitySchema = new mongoose.Schema(
    {
        activity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Activity",
            required: true
        },
        activityDate: {
            type: Date,
            default: null
        },
        guests: {
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

const tripCitySchema = new mongoose.Schema(
    {
        trip: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Trip",
            required: true
        },
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "State",
            required: true
        },
        city: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "City",
            required: true
        },
        order: {
            type: Number,
            required: true,
            min: 1
        },
        startDate: {
            type: Date,
            default: null
        },
        endDate: {
            type: Date,
            default: null
        },
        places: [tripPlaceSchema],
        activities: [tripActivitySchema],
        hotel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hotel",
            default: null
        },
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            default: null
        },
        foodPackage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FoodPackage",
            default: null
        },
        nights: {
            type: Number,
            default: 0,
            min: 0
        },
        hotelAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        foodAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        notes: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

tripCitySchema.index(
    {
        trip: 1,
        city: 1
    },
    {
        unique: true
    }
);

tripCitySchema.index({
    trip: 1,
    order: 1
});

module.exports = mongoose.model("TripCity", tripCitySchema);