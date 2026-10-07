const State = require("../models/State");
const City = require("../models/City");

const getStates = async (req, res) => {
    try {
        const states = await State.find({
            isActive: true
        })
            .populate("zone", "name")
            .sort({ name: 1 });

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

const getStateCities = async (req, res) => {
    try {
        const cities = await City.find({
            state: req.params.stateId,
            isActive: true
        }).sort({ name: 1 });

        res.json({
            success: true,
            cities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getStates,
    getStateCities
};