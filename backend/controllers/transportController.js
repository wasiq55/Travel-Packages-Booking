
const Transport = require("../models/Transport");
const Trip = require("../models/Trip");
const City = require("../models/City");

const getTransport = async (req, res) => {
    try {
        const {
            fromCity,
            toCity,
            type
        } = req.query;

        const filter = {
            isActive: true
        };

        if (fromCity) {
            filter.fromCity = fromCity;
        }

        if (toCity) {
            filter.toCity = toCity;
        }

        if (type) {
            filter.type = type;
        }

        const transports = await Transport.find(filter)
            .populate("fromCity", "name")
            .populate("toCity", "name")
            .sort({ pricePerPerson: 1 });

        res.json({
            success: true,
            count: transports.length,
            transports
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createTransport = async (req, res) => {
    try {
        const {
            name,
            type,
            provider,
            fromCity,
            toCity,
            pricePerPerson,
            duration,
            departureTime,
            arrivalTime
        } = req.body;

        const from = await City.findOne({
            _id: fromCity,
            isActive: true
        });

        const to = await City.findOne({
            _id: toCity,
            isActive: true
        });

        if (!from || !to) {
            return res.status(404).json({
                success: false,
                message: "Source or destination city not found"
            });
        }

        const transport = await Transport.create({
            name,
            type,
            provider,
            fromCity,
            toCity,
            pricePerPerson,
            duration,
            departureTime,
            arrivalTime
        });

        res.status(201).json({
            success: true,
            message: "Transport created successfully",
            transport
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getRideEstimate = async (req, res) => {
    try {
        const { pickup, drop } = req.body;

        const isValidCoordinates = (point) => {
            return (
                point &&
                Number.isFinite(Number(point.latitude)) &&
                Number.isFinite(Number(point.longitude)) &&
                Number(point.latitude) >= -90 &&
                Number(point.latitude) <= 90 &&
                Number(point.longitude) >= -180 &&
                Number(point.longitude) <= 180
            );
        };

        if (
            !isValidCoordinates(pickup) ||
            !isValidCoordinates(drop)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid pickup and drop latitude and longitude are required"
            });
        }

        const toRadians = (degrees) => {
            return degrees * (Math.PI / 180);
        };

        const lat1 = toRadians(Number(pickup.latitude));
        const lon1 = toRadians(Number(pickup.longitude));
        const lat2 = toRadians(Number(drop.latitude));
        const lon2 = toRadians(Number(drop.longitude));

        const latitudeDifference = lat2 - lat1;
        const longitudeDifference = lon2 - lon1;

        const haversine =
            Math.sin(latitudeDifference / 2) ** 2 +
            Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(longitudeDifference / 2) ** 2;

        const distanceKm =
            6371 *
            2 *
            Math.atan2(
                Math.sqrt(haversine),
                Math.sqrt(1 - haversine)
            );

        if (distanceKm < 0.05) {
            return res.status(400).json({
                success: false,
                message: "Pickup and drop locations must be different"
            });
        }

        const demoVehicles = [
            {
                type: "bike",
                name: "Bike",
                baseFare: 20,
                farePerKm: 8
            },
            {
                type: "auto",
                name: "Auto",
                baseFare: 30,
                farePerKm: 12
            },
            {
                type: "cab",
                name: "Cab",
                baseFare: 60,
                farePerKm: 18
            }
        ];

        const estimates = demoVehicles.map((vehicle) => {
            const estimatedFare = Math.round(
                vehicle.baseFare +
                distanceKm * vehicle.farePerKm
            );

            return {
                type: vehicle.type,
                name: vehicle.name,
                estimatedFare,
                currency: "INR",
                estimatedDurationMinutes: Math.max(
                    1,
                    Math.round((distanceKm / 25) * 60)
                )
            };
        });

        res.json({
            success: true,
            source: "mock",
            isLive: false,
            message: "Development-only estimates. These are not live Ola fares or confirmed ride availability.",
            distanceKm: Number(distanceKm.toFixed(2)),
            estimates
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const selectTransport = async (req, res) => {
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

        const transport = await Transport.findOne({
            _id: req.body.transportId,
            isActive: true
        });

        if (!transport) {
            return res.status(404).json({
                success: false,
                message: "Transport not found"
            });
        }

        const travelers =
            trip.travelers.adults +
            trip.travelers.children;

        const amount =
            transport.pricePerPerson *
            travelers;

        const existingTransportIndex =
            trip.transport.findIndex(
                item =>
                    item.fromCity.toString() ===
                    transport.fromCity.toString() &&
                    item.toCity.toString() ===
                    transport.toCity.toString()
            );

        const transportData = {
            transport: transport._id,
            fromCity: transport.fromCity,
            toCity: transport.toCity,
            travelers,
            amount
        };

        if (existingTransportIndex >= 0) {
            trip.transport[existingTransportIndex] =
                transportData;
        } else {
            trip.transport.push(transportData);
        }

        trip.currentStep = "activities";

        await trip.save();

        res.json({
            success: true,
            message: "Transport selected successfully",
            transport: transportData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const removeTransport = async (req, res) => {
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

        trip.transport = trip.transport.filter(
            item =>
                item._id.toString() !==
                req.params.transportId
        );

        await trip.save();

        res.json({
            success: true,
            message: "Transport removed successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getTransport,
    createTransport,
    selectTransport,
    removeTransport,
    getRideEstimate
};