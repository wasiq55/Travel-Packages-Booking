const Activity = require("../models/Activity");
const Trip = require("../models/Trip");
const TripCity = require("../models/TripCity");
const City = require("../models/City");

const getActivities = async (req, res) => {
    try {
        const filter = {
            isActive: true
        };

        if (req.query.city) {
            filter.city = req.query.city;
        }

        if (req.query.popular === "true") {
            filter.isPopular = true;
        }

        const activities = await Activity.find(filter)
            .populate("city", "name")
            .sort({
                isPopular: -1,
                pricePerPerson: 1
            });

        res.json({
            success: true,
            count: activities.length,
            activities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createActivity = async (req, res) => {
    try {
        const {
            name,
            city,
            description,
            image,
            pricePerPerson,
            duration,
            isPopular
        } = req.body;

        const cityData = await City.findOne({
            _id: city,
            isActive: true
        });

        if (!cityData) {
            return res.status(404).json({
                success: false,
                message: "City not found"
            });
        }

        const activity = await Activity.create({
            name,
            city,
            description,
            image,
            pricePerPerson,
            duration,
            isPopular
        });

        res.status(201).json({
            success: true,
            message: "Activity created successfully",
            activity
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const addActivityToTrip = async (req, res) => {
    try {
        const trip = await Trip.findOne({
            _id: req.params.tripId,
            user: req.user._id
        });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: "Trip not found"
            });
        }

        const tripCity = await TripCity.findOne({
            _id: req.params.tripCityId,
            trip: trip._id
        });

        if (!tripCity) {
            return res.status(404).json({
                success: false,
                message: "Trip city not found"
            });
        }

        const activity = await Activity.findOne({
            _id: req.body.activityId,
            city: tripCity.city,
            isActive: true
        });

        if (!activity) {
            return res.status(404).json({
                success: false,
                message: "Activity does not belong to this city"
            });
        }

        const guests =
            req.body.guests ||
            trip.travelers.adults +
            trip.travelers.children;

        const amount =
            activity.pricePerPerson *
            guests;

        const exists = tripCity.activities.some(
            item =>
                item.activity.toString() ===
                activity._id.toString()
        );

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Activity already added"
            });
        }

        tripCity.activities.push({
            activity: activity._id,
            activityDate: req.body.activityDate || null,
            guests,
            amount
        });

        await tripCity.save();

        trip.currentStep = "review";

        await trip.save();

        const updatedCity = await TripCity.findById(
            tripCity._id
        )
            .populate("city", "name")
            .populate(
                "activities.activity",
                "name description image pricePerPerson duration"
            );

        res.status(201).json({
            success: true,
            message: "Activity added successfully",
            tripCity: updatedCity
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const removeActivityFromTrip = async (req, res) => {
    try {
        const trip = await Trip.findOne({
            _id: req.params.tripId,
            user: req.user._id
        });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: "Trip not found"
            });
        }

        const tripCity = await TripCity.findOne({
            _id: req.params.tripCityId,
            trip: trip._id
        });

        if (!tripCity) {
            return res.status(404).json({
                success: false,
                message: "Trip city not found"
            });
        }

        const originalLength =
            tripCity.activities.length;

        tripCity.activities =
            tripCity.activities.filter(
                item =>
                    item._id.toString() !==
                    req.params.activityId
            );

        if (
            originalLength ===
            tripCity.activities.length
        ) {
            return res.status(404).json({
                success: false,
                message: "Activity not found"
            });
        }

        await tripCity.save();

        res.json({
            success: true,
            message: "Activity removed successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getActivities,
    createActivity,
    addActivityToTrip,
    removeActivityFromTrip
};