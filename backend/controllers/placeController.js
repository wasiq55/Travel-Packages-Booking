const Place = require("../models/Place");

const getPlaces = async (req, res) => {
    try {
        const places = await Place.find({
            isActive: true
        })
            .populate("city", "name")
            .sort({ name: 1 });

        res.json({
            success: true,
            places
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getPlaces
};