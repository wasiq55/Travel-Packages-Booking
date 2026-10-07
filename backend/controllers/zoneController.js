const Zone = require("../models/Zone");
const State = require("../models/State");

const getZones = async (req, res) => {
    try {
        const zones = await Zone.find({ isActive: true }).sort({ name: 1 });

        res.json({
            success: true,
            zones
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getZoneStates = async (req, res) => {
    try {
        const states = await State.find({
            zone: req.params.zoneId,
            isActive: true
        }).sort({ name: 1 });

        res.json({
            success: true,
            states
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getZones,
    getZoneStates
};