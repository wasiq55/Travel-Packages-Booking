const mongoose = require("mongoose");

const foodPackageSchema = new mongoose.Schema(
    {
        hotel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hotel",
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        mealType: {
            type: String,
            enum: [
                "breakfast",
                "lunch",
                "dinner",
                "full-day"
            ],
            required: true
        },
        foodType: {
            type: String,
            enum: [
                "veg",
                "non-veg",
                "both"
            ],
            default: "veg"
        },
        pricePerPerson: {
            type: Number,
            required: true,
            min: 0
        },
        description: {
            type: String,
            trim: true
        },
        image: {
            type: String
        },
        menuItems: [
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

module.exports = mongoose.model("FoodPackage", foodPackageSchema);