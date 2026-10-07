
const Trip = require("../models/Trip");
const TripCity = require("../models/TripCity");
const Zone = require("../models/Zone");
const State = require("../models/State");
const City = require("../models/City");
const Place = require("../models/Place");
const Room = require("../models/Room");
const FoodPackage = require("../models/FoodPackage");
const mongoose = require("mongoose");

const getUserTrip = async (tripId, userId) => {
    return await Trip.findOne({
        _id: tripId,
        user: userId
    });
};

const isValidDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) {
        return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    return (
        !isNaN(start.getTime()) &&
        !isNaN(end.getTime()) &&
        start < end
    );
};

const addDays = (date, days) => {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
};

const getTripWithCities = async (tripId, userId) => {
    const trip = await Trip.findOne({
        _id: tripId,
        user: userId
    }).populate("zone", "name slug");

    if (!trip) {
        return null;
    }

    const cities = await TripCity.find({
        trip: trip._id
    })
        .populate("state", "name slug")
        .populate("city", "name slug description image isPopular")
        .populate("places.place", "name description image entryFee isPopular")
        .populate("hotel", "name address rating images checkInTime checkOutTime")
        .populate("room", "roomNumber roomType pricePerNight maxGuests")
        .populate("foodPackage", "title description mealType foodType pricePerPerson")
        .sort({ order: 1 });

    return {
        trip,
        cities
    };
};

const createTrip = async (req, res) => {
    try {
        const {
            title,
            zone,
            startDate,
            endDate,
            adults,
            children,
            rooms
        } = req.body;

        if (!zone) {
            return res.status(400).json({
                success: false,
                message: "Zone is required"
            });
        }

        const zoneData = await Zone.findOne({
            _id: zone,
            isActive: true
        });

        if (!zoneData) {
            return res.status(404).json({
                success: false,
                message: "Zone not found"
            });
        }

        if (startDate && endDate && !isValidDateRange(startDate, endDate)) {
            return res.status(400).json({
                success: false,
                message: "Invalid trip date range"
            });
        }

        const trip = await Trip.create({
            user: req.user._id,
            title: title || "My Custom Trip",
            zone,
            startDate: startDate || null,
            endDate: endDate || null,
            travelers: {
                adults: adults || 1,
                children: children || 0,
                rooms: rooms || 1
            },
            currentStep: "cities",
            status: "draft"
        });

        return res.status(201).json({
            success: true,
            message: "Trip created successfully",
            trip
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getMyTrips = async (req, res) => {
    try {
        const trips = await Trip.find({
            user: req.user._id
        })
            .populate("zone", "name slug")
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            count: trips.length,
            trips
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getTrip = async (req, res) => {
    try {
        const result = await getTripWithCities(
            req.params.tripId,
            req.user._id
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Trip not found"
            });
        }

        return res.json({
            success: true,
            ...result
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateTrip = async (req, res) => {
    try {
        const trip = await getUserTrip(
            req.params.tripId,
            req.user._id
        );

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: "Trip not found"
            });
        }

        if (["confirmed", "completed", "cancelled"].includes(trip.status)) {
            return res.status(400).json({
                success: false,
                message: "This trip cannot be edited"
            });
        }

        const {
            title,
            zone,
            startDate,
            endDate,
            adults,
            children,
            rooms
        } = req.body;

        const existingCities = await TripCity.countDocuments({
            trip: trip._id
        });

        if (
            zone &&
            zone.toString() !== trip.zone.toString() &&
            existingCities > 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Remove existing cities before changing the zone"
            });
        }

        if (zone) {
            const zoneData = await Zone.findOne({
                _id: zone,
                isActive: true
            });

            if (!zoneData) {
                return res.status(404).json({
                    success: false,
                    message: "Zone not found"
                });
            }

            trip.zone = zone;
        }

        const newStartDate = startDate !== undefined
            ? startDate
            : trip.startDate;

        const newEndDate = endDate !== undefined
            ? endDate
            : trip.endDate;

        if (newStartDate && newEndDate) {
            if (!isValidDateRange(newStartDate, newEndDate)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid trip date range"
                });
            }

            trip.startDate = newStartDate;
            trip.endDate = newEndDate;
        } else {
            trip.startDate = newStartDate || null;
            trip.endDate = newEndDate || null;
        }

        if (title !== undefined) {
            trip.title = title;
        }

        if (adults !== undefined) {
            trip.travelers.adults = adults;
        }

        if (children !== undefined) {
            trip.travelers.children = children;
        }

        if (rooms !== undefined) {
            trip.travelers.rooms = rooms;
        }

        await trip.save();

        return res.json({
            success: true,
            message: "Trip updated successfully",
            trip
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const addCityToTrip = async (req, res) => {
    try {
        const trip = await getUserTrip(
            req.params.tripId,
            req.user._id
        );

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: "Trip not found"
            });
        }

        const {
            stateId,
            cityId,
            startDate,
            endDate
        } = req.body;

        if (!stateId || !cityId) {
            return res.status(400).json({
                success: false,
                message: "State and city are required"
            });
        }

        const state = await State.findOne({
            _id: stateId,
            isActive: true
        });

        if (!state) {
            return res.status(404).json({
                success: false,
                message: "State not found"
            });
        }

        if (state.zone.toString() !== trip.zone.toString()) {
            return res.status(400).json({
                success: false,
                message: "State does not belong to the selected zone"
            });
        }

        const city = await City.findOne({
            _id: cityId,
            state: stateId,
            isActive: true
        });

        if (!city) {
            return res.status(404).json({
                success: false,
                message: "City does not belong to this state"
            });
        }

        const existingCity = await TripCity.findOne({
            trip: trip._id,
            city: cityId
        });

        if (existingCity) {
            return res.status(400).json({
                success: false,
                message: "City is already added to this trip"
            });
        }

        if (startDate && endDate) {
            if (!isValidDateRange(startDate, endDate)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid city date range"
                });
            }

            if (trip.startDate && trip.endDate) {
                if (
                    new Date(startDate) < new Date(trip.startDate) ||
                    new Date(endDate) > new Date(trip.endDate)
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "City dates must be inside trip dates"
                    });
                }
            }
        }

        const lastCity = await TripCity.findOne({
            trip: trip._id
        }).sort({ order: -1 });

        const order = lastCity ? lastCity.order + 1 : 1;

        const tripCity = await TripCity.create({
            trip: trip._id,
            state: stateId,
            city: cityId,
            order,
            startDate: startDate || null,
            endDate: endDate || null
        });

        trip.currentStep = "places";
        trip.status = "planning";

        await trip.save();

        const populatedCity = await TripCity.findById(tripCity._id)
            .populate("state", "name slug")
            .populate("city", "name slug description image isPopular");

        return res.status(201).json({
            success: true,
            message: "City added to trip",
            tripCity: populatedCity
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const addMultipleCities = async (req, res) => {
    try {
        const trip = await getUserTrip(
            req.params.tripId,
            req.user._id
        );

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: "Trip not found"
            });
        }

        const { cities } = req.body;

        if (!Array.isArray(cities) || cities.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cities array is required"
            });
        }

        const existingCities = await TripCity.find({
            trip: trip._id
        });

        const existingCityIds = existingCities.map(city =>
            city.city.toString()
        );

        const addedCities = [];

        let currentOrder = existingCities.length > 0
            ? Math.max(...existingCities.map(city => city.order)) + 1
            : 1;

        for (const item of cities) {
            const { stateId, cityId } = item;

            if (!stateId || !cityId) {
                continue;
            }

            if (existingCityIds.includes(cityId.toString())) {
                continue;
            }

            const state = await State.findOne({
                _id: stateId,
                isActive: true
            });

            if (!state) {
                continue;
            }

            if (state.zone.toString() !== trip.zone.toString()) {
                continue;
            }

            const city = await City.findOne({
                _id: cityId,
                state: stateId,
                isActive: true
            });

            if (!city) {
                continue;
            }

            const tripCity = await TripCity.create({
                trip: trip._id,
                state: stateId,
                city: cityId,
                order: currentOrder
            });

            addedCities.push(tripCity);
            existingCityIds.push(cityId.toString());
            currentOrder++;
        }

        if (addedCities.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid new cities were added"
            });
        }

        trip.currentStep = "places";
        trip.status = "planning";

        await trip.save();

        const result = await TripCity.find({
            trip: trip._id
        })
            .populate("state", "name slug")
            .populate("city", "name slug description image isPopular")
            .sort({ order: 1 });

        return res.status(201).json({
            success: true,
            message: "Cities added to trip successfully",
            count: addedCities.length,
            cities: result
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const removeCityFromTrip = async (req, res) => {
    try {
        const trip = await getUserTrip(
            req.params.tripId,
            req.user._id
        );

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

        await TripCity.deleteOne({
            _id: tripCity._id
        });

        const remainingCities = await TripCity.find({
            trip: trip._id
        }).sort({ order: 1 });

        for (let index = 0; index < remainingCities.length; index++) {
            remainingCities[index].order = index + 1;
            await remainingCities[index].save();
        }

        if (remainingCities.length === 0) {
            trip.currentStep = "cities";
            trip.status = "draft";
        }

        await trip.save();

        return res.json({
            success: true,
            message: "City removed from trip"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateTripCity = async (req, res) => {
    try {
        const trip = await getUserTrip(
            req.params.tripId,
            req.user._id
        );

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

        const {
            startDate,
            endDate,
            notes
        } = req.body;

        if (startDate !== undefined || endDate !== undefined) {
            const newStartDate = startDate !== undefined
                ? startDate
                : tripCity.startDate;

            const newEndDate = endDate !== undefined
                ? endDate
                : tripCity.endDate;

            if (
                newStartDate &&
                newEndDate &&
                !isValidDateRange(newStartDate, newEndDate)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid city date range"
                });
            }

            if (
                trip.startDate &&
                trip.endDate &&
                newStartDate &&
                newEndDate
            ) {
                if (
                    new Date(newStartDate) < new Date(trip.startDate) ||
                    new Date(newEndDate) > new Date(trip.endDate)
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "City dates must be inside trip dates"
                    });
                }
            }

            tripCity.startDate = newStartDate || null;
            tripCity.endDate = newEndDate || null;

            if (newStartDate && newEndDate) {
                tripCity.nights = Math.ceil(
                    (new Date(newEndDate) - new Date(newStartDate)) /
                    (1000 * 60 * 60 * 24)
                );
            }
        }

        if (notes !== undefined) {
            tripCity.notes = notes;
        }

        await tripCity.save();

        return res.json({
            success: true,
            message: "Trip city updated successfully",
            tripCity
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const generateItinerary = async (req, res) => {
    try {
        const trip = await getUserTrip(
            req.params.tripId,
            req.user._id
        );

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: "Trip not found"
            });
        }

        if (!trip.startDate || !trip.endDate) {
            return res.status(400).json({
                success: false,
                message: "Set trip start date and end date first"
            });
        }

        const cities = await TripCity.find({
            trip: trip._id
        }).sort({ order: 1 });

        if (cities.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Add at least one city first"
            });
        }

        const totalNights = Math.ceil(
            (new Date(trip.endDate) - new Date(trip.startDate)) /
            (1000 * 60 * 60 * 24)
        );

        if (totalNights < cities.length) {
            return res.status(400).json({
                success: false,
                message: "Trip must have at least one night for each city"
            });
        }

        const baseNights = Math.floor(totalNights / cities.length);
        const extraNights = totalNights % cities.length;

        let currentDate = new Date(trip.startDate);

        for (let index = 0; index < cities.length; index++) {
            const nights =
                baseNights + (index < extraNights ? 1 : 0);

            const cityStartDate = new Date(currentDate);
            const cityEndDate = addDays(cityStartDate, nights);

            cities[index].startDate = cityStartDate;
            cities[index].endDate = cityEndDate;
            cities[index].nights = nights;

            await cities[index].save();

            currentDate = cityEndDate;
        }

        trip.currentStep = "places";
        trip.status = "planning";

        await trip.save();

        const updatedCities = await TripCity.find({
            trip: trip._id
        })
            .populate("state", "name slug")
            .populate("city", "name slug description image isPopular")
            .sort({ order: 1 });

        return res.json({
            success: true,
            message: "Itinerary generated successfully",
            totalNights,
            cities: updatedCities
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const addPlaceToTripCity = async (req, res) => {
    try {
        const trip = await getUserTrip(
            req.params.tripId,
            req.user._id
        );

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

        const {
            placeId,
            visitDate,
            notes
        } = req.body;

        if (!placeId) {
            return res.status(400).json({
                success: false,
                message: "Place is required"
            });
        }

        const place = await Place.findOne({
            _id: placeId,
            city: tripCity.city,
            isActive: true
        });

        if (!place) {
            return res.status(404).json({
                success: false,
                message: "Place does not belong to this city"
            });
        }

        const alreadyAdded = tripCity.places.some(
            item => item.place.toString() === placeId.toString()
        );

        if (alreadyAdded) {
            return res.status(400).json({
                success: false,
                message: "Place already added"
            });
        }

        if (visitDate && tripCity.startDate && tripCity.endDate) {
            const visit = new Date(visitDate);

            if (
                visit < new Date(tripCity.startDate) ||
                visit >= new Date(tripCity.endDate)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Visit date must be inside the city itinerary"
                });
            }
        }

        tripCity.places.push({
            place: placeId,
            visitDate: visitDate || null,
            notes: notes || ""
        });

        await tripCity.save();

        trip.currentStep = "hotels";
        await trip.save();

        const updatedTripCity = await TripCity.findById(tripCity._id)
            .populate("city", "name slug")
            .populate("places.place", "name description image entryFee isPopular");

        return res.status(201).json({
            success: true,
            message: "Place added to itinerary",
            tripCity: updatedTripCity
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const addMultiplePlacesToTripCity = async (req, res) => {
    try {
        const trip = await getUserTrip(
            req.params.tripId,
            req.user._id
        );

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

        const { places } = req.body;

        if (!Array.isArray(places) || places.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Places array is required"
            });
        }

        const addedPlaces = [];

        for (const item of places) {
            const {
                placeId,
                visitDate,
                notes
            } = item;

            if (!placeId) {
                continue;
            }

            const place = await Place.findOne({
                _id: placeId,
                city: tripCity.city,
                isActive: true
            });

            if (!place) {
                continue;
            }

            const alreadyAdded = tripCity.places.some(
                selected =>
                    selected.place.toString() === placeId.toString()
            );

            if (alreadyAdded) {
                continue;
            }

            tripCity.places.push({
                place: placeId,
                visitDate: visitDate || null,
                notes: notes || ""
            });

            addedPlaces.push(place);
        }

        if (addedPlaces.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No new valid places were added"
            });
        }

        await tripCity.save();

        trip.currentStep = "hotels";
        await trip.save();

        const updatedTripCity = await TripCity.findById(tripCity._id)
            .populate("city", "name slug")
            .populate("places.place", "name description image entryFee isPopular");

        return res.status(201).json({
            success: true,
            message: "Places added successfully",
            count: addedPlaces.length,
            tripCity: updatedTripCity
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const removePlaceFromTripCity = async (req, res) => {
    try {
        const trip = await getUserTrip(
            req.params.tripId,
            req.user._id
        );

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

        const originalLength = tripCity.places.length;

        tripCity.places = tripCity.places.filter(
            item =>
                item.place.toString() !== req.params.placeId.toString()
        );

        if (tripCity.places.length === originalLength) {
            return res.status(404).json({
                success: false,
                message: "Place not found in itinerary"
            });
        }

        await tripCity.save();

        return res.json({
            success: true,
            message: "Place removed from itinerary"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const selectTripHotel = async (req, res) => {
    try {
        const { tripId, tripCityId } = req.params;
        const { hotelId, roomId, foodPackageId } = req.body;

        const trip = await getUserTrip(tripId, req.user._id);

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: "Trip not found"
            });
        }

        if (!hotelId || !roomId) {
            return res.status(400).json({
                success: false,
                message: "Hotel and room are required"
            });
        }

        if (
            !mongoose.isValidObjectId(hotelId) ||
            !mongoose.isValidObjectId(roomId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid hotel or room ID"
            });
        }

        const tripCity = await TripCity.findOne({
            _id: tripCityId,
            trip: trip._id
        });

        if (!tripCity) {
            return res.status(404).json({
                success: false,
                message: "Trip city not found"
            });
        }

        const room = await Room.findOne({
            _id: roomId,
            hotel: hotelId
        });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found for this hotel"
            });
        }

        const nights = Math.max(1, Number(tripCity.nights) || 1);
        const roomPrice = Number(room.pricePerNight) || 0;

        let foodAmount = 0;
        let selectedFoodPackage = null;

        if (foodPackageId) {
            if (!mongoose.isValidObjectId(foodPackageId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid food package ID"
                });
            }

            selectedFoodPackage = await FoodPackage.findById(foodPackageId);

            if (!selectedFoodPackage) {
                return res.status(404).json({
                    success: false,
                    message: "Food package not found"
                });
            }

            const pricePerPerson =
                Number(selectedFoodPackage.pricePerPerson) || 0;

            const travelers =
                (Number(trip.travelers?.adults) || 0) +
                (Number(trip.travelers?.children) || 0);

            foodAmount =
                pricePerPerson * Math.max(1, travelers) * nights;
        }

        tripCity.hotel = hotelId;
        tripCity.room = roomId;
        tripCity.nights = nights;
        tripCity.hotelAmount = roomPrice * nights;
        tripCity.foodPackage = selectedFoodPackage
            ? selectedFoodPackage._id
            : null;
        tripCity.foodAmount = foodAmount;

        await tripCity.save();

        trip.currentStep = "hotels";
        await trip.save();

        const updatedTripCity = await TripCity.findById(tripCity._id)
            .populate("hotel", "name address rating images checkInTime checkOutTime")
            .populate("room", "roomNumber roomType pricePerNight maxGuests")
            .populate("foodPackage");

        return res.json({
            success: true,
            message: "Hotel, room, and food selection saved successfully",
            tripCity: updatedTripCity
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteTrip = async (req, res) => {
    try {
        const trip = await getUserTrip(
            req.params.tripId,
            req.user._id
        );

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: "Trip not found"
            });
        }

        if (!["draft", "planning"].includes(trip.status)) {
            return res.status(400).json({
                success: false,
                message: "Only draft or planning trips can be deleted"
            });
        }

        await TripCity.deleteMany({
            trip: trip._id
        });

        await Trip.deleteOne({
            _id: trip._id
        });

        return res.json({
            success: true,
            message: "Trip deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getTripSummary = async (req, res) => {
    try {
        const result = await getTripWithCities(
            req.params.tripId,
            req.user._id
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Trip not found"
            });
        }

        const { trip, cities } = result;

        const adults = Number(trip.travelers?.adults) || 0;
        const children = Number(trip.travelers?.children) || 0;
        const travelerCount = Math.max(1, adults + children);

        let hotelAmount = 0;
        let foodAmount = 0;
        let entryFees = 0;
        let activityAmount = 0;
        let totalNights = 0;
        let totalPlaces = 0;

        for (const city of cities) {
            let nights = Number(city.nights) || 0;

            if (
                nights <= 0 &&
                city.startDate &&
                city.endDate
            ) {
                nights = Math.max(
                    0,
                    Math.ceil(
                        (
                            new Date(city.endDate).getTime() -
                            new Date(city.startDate).getTime()
                        ) / (1000 * 60 * 60 * 24)
                    )
                );
            }

            const roomPrice = Number(city.room?.pricePerNight) || 0;
            const calculatedHotelAmount = city.room
                ? roomPrice * nights
                : 0;

            const foodPricePerPerson =
                Number(city.foodPackage?.pricePerPerson) || 0;

            const calculatedFoodAmount = city.foodPackage
                ? foodPricePerPerson * travelerCount * nights
                : 0;

            city.nights = nights;
            city.hotelAmount = calculatedHotelAmount;
            city.foodAmount = calculatedFoodAmount;

            await city.save();

            hotelAmount += calculatedHotelAmount;
            foodAmount += calculatedFoodAmount;
            totalNights += nights;

            totalPlaces += city.places.length;

            for (const selectedPlace of city.places) {
                entryFees += Number(
                    selectedPlace.place?.entryFee
                ) || 0;
            }

            for (const activity of city.activities || []) {
                activityAmount += Number(activity.amount) || 0;
            }
        }

        const rideAmount = (trip.rideSelections || []).reduce(
            (total, ride) => {
                return total + (Number(ride.amount) || 0);
            },
            0
        );

        const subtotal =
            hotelAmount +
            foodAmount +
            entryFees +
            activityAmount +
            rideAmount;

        const taxes = Number(trip.taxes) || 0;
        const discount = Number(trip.discount) || 0;

        const totalAmount = Math.max(
            0,
            subtotal + taxes - discount
        );

        trip.subtotal = subtotal;
        trip.totalAmount = totalAmount;

        await trip.save();

        return res.json({
            success: true,
            summary: {
                tripId: trip._id,
                title: trip.title,
                zone: trip.zone,
                startDate: trip.startDate,
                endDate: trip.endDate,
                travelers: trip.travelers,
                totalCities: cities.length,
                totalPlaces,
                totalNights,
                hotelAmount,
                foodAmount,
                entryFees,
                activityAmount,
                rideAmount,
                subtotal,
                taxes,
                discount,
                totalAmount,
                status: trip.status,
                currentStep: trip.currentStep
            },
            cities
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const saveTripRideSelections = async (req, res) => {
    try {
        const trip = await getUserTrip(
            req.params.tripId,
            req.user._id
        );

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: "Trip not found"
            });
        }

        const { rides } = req.body;

        if (!Array.isArray(rides) || rides.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one ride selection is required"
            });
        }

        const validRideTypes = ["bike", "auto", "cab"];
        const validatedRides = [];

        for (const ride of rides) {
            const {
                fromCity,
                toCity,
                rideType,
                rideName,
                estimatedFare,
                estimatedDurationMinutes,
                travelers
            } = ride;

            if (
                !mongoose.isValidObjectId(fromCity) ||
                !mongoose.isValidObjectId(toCity)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid city ID in ride selection"
                });
            }

            if (!validRideTypes.includes(rideType)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid ride type"
                });
            }

            if (
                !rideName ||
                !Number.isFinite(Number(estimatedFare)) ||
                Number(estimatedFare) < 0 ||
                !Number.isFinite(Number(estimatedDurationMinutes)) ||
                Number(estimatedDurationMinutes) < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid ride details"
                });
            }

            const travelerCount = Math.max(
                1,
                Number(travelers) || 1
            );

            validatedRides.push({
                fromCity,
                toCity,
                rideType,
                rideName,
                estimatedFare: Number(estimatedFare),
                estimatedDurationMinutes: Number(estimatedDurationMinutes),
                travelers: travelerCount,
                amount: Number(estimatedFare) * travelerCount,
                source: "mock",
                isLive: false
            });
        }

        trip.rideSelections = validatedRides;
        trip.currentStep = "review";

        await trip.save();

        return res.json({
            success: true,
            message: "Ride selections saved successfully",
            rideSelections: trip.rideSelections
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createTrip,
    getMyTrips,
    getTrip,
    saveTripRideSelections,
    updateTrip,
    addCityToTrip,
    addMultipleCities,
    removeCityFromTrip,
    updateTripCity,
    generateItinerary,
    addPlaceToTripCity,
    addMultiplePlacesToTripCity,
    removePlaceFromTripCity,
    deleteTrip,
    getTripSummary,
    selectTripHotel
};