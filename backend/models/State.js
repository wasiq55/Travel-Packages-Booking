const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema(
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
        zone: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Zone",
            required: true
        },
        description: {
            type: String
        },
        image: {
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

stateSchema.index({ zone: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("State", stateSchema);