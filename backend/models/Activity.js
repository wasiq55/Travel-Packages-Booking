const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
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
            trim: true
        },

        image: {
            type: String
        },

        pricePerPerson: {
            type: Number,
            required: true,
            min: 0
        },

        duration: {
            type: String
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

activitySchema.index({
    city: 1,
    name: 1
});

module.exports = mongoose.model("Activity", activitySchema);