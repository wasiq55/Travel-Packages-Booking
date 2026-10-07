const Trip = require("../models/Trip");
const TripCity = require("../models/TripCity");
const Hotel = require("../models/Hotel");
const Room = require("../models/Room");

const selectHotel = async (req, res) => {
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

        const { hotelId, roomId } = req.body;

        if (!hotelId || !roomId) {
            return res.status(400).json({
                success: false,
                message: "Hotel and room are required"
            });
        }

        const hotel = await Hotel.findOne({
            _id: hotelId,
            city: tripCity.city,
            isApproved: true,
            isActive: true
        });

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel is not available in this city"
            });
        }

        const room = await Room.findOne({
            _id: roomId,
            hotel: hotel._id,
            isAvailable: true
        });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room is not available"
            });
        }

        const nights = tripCity.nights || 0;
        const rooms = trip.travelers.rooms || 1;

        const hotelAmount =
            room.pricePerNight *
            nights *
            rooms;

        tripCity.hotel = hotel._id;
        tripCity.room = room._id;
        tripCity.hotelAmount = hotelAmount;

        await tripCity.save();

        trip.currentStep = "transport";

        await trip.save();

        const updatedCity = await TripCity.findById(
            tripCity._id
        )
            .populate("city", "name")
            .populate("hotel", "name address rating")
            .populate(
                "room",
                "roomNumber roomType pricePerNight maxGuests"
            );

        res.json({
            success: true,
            message: "Hotel selected successfully",
            tripCity: updatedCity,
            hotelAmount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const removeHotel = async (req, res) => {
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

        tripCity.hotel = null;
        tripCity.room = null;
        tripCity.hotelAmount = 0;

        await tripCity.save();

        res.json({
            success: true,
            message: "Hotel removed from trip"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    selectHotel,
    removeHotel
};