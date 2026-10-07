const Trip = require("../models/Trip");
const TripCity = require("../models/TripCity");

const calculateTripPrice = async (req, res) => {
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

        const cities = await TripCity.find({
            trip: trip._id
        }).populate("places.place", "entryFee");

        let hotelAmount = 0;
        let activityAmount = 0;
        let entryFeeAmount = 0;
        let transportAmount = 0;

        cities.forEach(city => {
            hotelAmount += city.hotelAmount || 0;

            city.activities.forEach(activity => {
                activityAmount += activity.amount || 0;
            });

            city.places.forEach(place => {
                entryFeeAmount +=
                    place.place?.entryFee || 0;
            });
        });

        trip.transport.forEach(transport => {
            transportAmount += transport.amount || 0;
        });

        const subtotal =
            hotelAmount +
            activityAmount +
            entryFeeAmount +
            transportAmount;

        const taxRate = 0.05;

        const taxes =
            Math.round(subtotal * taxRate * 100) / 100;

        const discount = trip.discount || 0;

        const totalAmount =
            subtotal +
            taxes -
            discount;

        trip.subtotal = subtotal;
        trip.taxes = taxes;
        trip.totalAmount = totalAmount;

        trip.currentStep = "review";

        await trip.save();

        res.json({
            success: true,
            price: {
                hotelAmount,
                activityAmount,
                entryFeeAmount,
                transportAmount,
                subtotal,
                taxes,
                discount,
                totalAmount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    calculateTripPrice
};