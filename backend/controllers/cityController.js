
const City = require("../models/City");
const Place = require("../models/Place");

const getCities = async (req, res) => {
    try {
        const filter = {
            isActive: true
        };

        if (req.query.stateId) {
            filter.state = req.query.stateId;
        }

        const cities = await City.find(filter)
            .populate("state", "name")
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: cities.length,
            cities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getCitiesByState = async (req, res) => {
    try {
        const { stateId } = req.params;

        const cities = await City.find({
            state: stateId,
            isActive: true
        })
            .populate("state", "name")
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: cities.length,
            cities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateCityLocation = async (req, res) => {
    try {
        const { cityId } = req.params;
        const { latitude, longitude } = req.body;

        if (
            typeof latitude !== "number" ||
            typeof longitude !== "number" ||
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid numeric latitude and longitude are required"
            });
        }

        const city = await City.findByIdAndUpdate(
            cityId,
            {
                $set: {
                    "location.latitude": latitude,
                    "location.longitude": longitude
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!city) {
            return res.status(404).json({
                success: false,
                message: "City not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "City location updated successfully",
            city
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getCityPlaces = async (req, res) => {
    try {
        const { cityId } = req.params;

        const places = await Place.find({
            city: cityId,
            isActive: true
        })
            .populate("city", "name image")
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: places.length,
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
    getCities,
    getCitiesByState,
    getCityPlaces,
    updateCityLocation
};