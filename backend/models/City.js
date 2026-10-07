
const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        slug: {
            type: String,
            required: true
        },

        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "State",
            required: true
        },

        description: {
            type: String
        },

        image: {
            type: String
        },

        location: {
            latitude: {
                type: Number
            },
            longitude: {
                type: Number
            }
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

citySchema.index({ state: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("City", citySchema);