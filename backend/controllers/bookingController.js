const crypto = require("crypto");

const Trip = require("../models/Trip");
const Booking = require("../models/Booking");
const Hotel = require("../models/Hotel");
const Room = require("../models/Room");

const generateBookingNumber = () => {
    return (
        "TRV-" +
        Date.now() +
        "-" +
        crypto.randomBytes(3).toString("hex").toUpperCase()
    );
};

const createBooking = async (req, res) => {
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

        if (!trip.startDate || !trip.endDate) {
            return res.status(400).json({
                success: false,
                message: "Trip dates are required"
            });
        }

        if (
            !Number.isFinite(Number(trip.totalAmount)) ||
            trip.totalAmount <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Trip price must be calculated first"
            });
        }

        if (
            ["confirmed", "completed"].includes(
                trip.status
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Trip is already booked"
            });
        }

        const existingBooking = await Booking.findOne({
            trip: trip._id,
            user: req.user._id,
            bookingStatus: {
                $in: [
                    "pending",
                    "payment_pending",
                    "confirmed"
                ]
            }
        });

        if (existingBooking) {
            const isPaid =
                existingBooking.paymentStatus === "paid" ||
                existingBooking.bookingStatus === "confirmed";

            if (isPaid) {
                return res.status(409).json({
                    success: false,
                    message:
                        "This booking has already been paid or confirmed",
                    booking: existingBooking
                });
            }

            existingBooking.totalAmount =
                trip.totalAmount;

            existingBooking.travelers =
                trip.travelers;

            existingBooking.startDate =
                trip.startDate;

            existingBooking.endDate =
                trip.endDate;

            existingBooking.bookingStatus =
                "payment_pending";

            existingBooking.paymentStatus =
                "unpaid";

            await existingBooking.save();

            trip.status = "payment_pending";
            trip.currentStep = "payment";

            await trip.save();

            return res.status(200).json({
                success: true,
                message:
                    "Existing pending booking updated successfully",
                booking: existingBooking
            });
        }

        const booking = await Booking.create({
            user: req.user._id,
            trip: trip._id,
            bookingType: "trip",
            bookingNumber: generateBookingNumber(),
            travelers: trip.travelers,
            startDate: trip.startDate,
            endDate: trip.endDate,
            totalAmount: trip.totalAmount,
            bookingStatus: "payment_pending",
            paymentStatus: "unpaid"
        });

        trip.status = "payment_pending";
        trip.currentStep = "payment";

        await trip.save();

        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createHotelBooking = async (req, res) => {
    try {
        const {
            hotelId,
            roomId,
            checkIn,
            checkOut,
            guests,
            guestDetails,
            totalAmount
        } = req.body;

        if (
            !hotelId ||
            !roomId ||
            !checkIn ||
            !checkOut
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Hotel, room, check-in and check-out are required"
            });
        }

        const startDate = new Date(checkIn);
        const endDate = new Date(checkOut);

        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking dates"
            });
        }

        if (endDate <= startDate) {
            return res.status(400).json({
                success: false,
                message:
                    "Check-out must be after check-in"
            });
        }

        const hotel = await Hotel.findById(hotelId);

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }

        const room = await Room.findOne({
            _id: roomId,
            hotel: hotelId
        });

        if (!room) {
            return res.status(404).json({
                success: false,
                message:
                    "Room not found for this hotel"
            });
        }

        if (room.isAvailable === false) {
            return res.status(400).json({
                success: false,
                message: "Room is currently unavailable"
            });
        }

        const existingBooking =
            await Booking.findOne({
                hotel: hotelId,
                room: roomId,
                bookingStatus: {
                    $in: [
                        "pending",
                        "payment_pending",
                        "confirmed"
                    ]
                },
                startDate: {
                    $lt: endDate
                },
                endDate: {
                    $gt: startDate
                }
            });

        if (existingBooking) {
            return res.status(409).json({
                success: false,
                message:
                    "This room is already booked for the selected dates"
            });
        }

        const amount = Number(totalAmount);

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking amount"
            });
        }

        const adults = Math.max(
            Number(guests) || 1,
            1
        );

        const booking = await Booking.create({
            user: req.user._id,
            hotel: hotelId,
            room: roomId,
            bookingType: "hotel",
            bookingNumber: generateBookingNumber(),

            travelers: {
                adults,
                children: 0,
                rooms: 1
            },

            guestDetails: {
                firstName:
                    guestDetails?.firstName || "",
                lastName:
                    guestDetails?.lastName || "",
                email:
                    guestDetails?.email || "",
                phone:
                    guestDetails?.phone || ""
            },

            startDate,
            endDate,
            totalAmount: amount,

            bookingStatus:
                "payment_pending",

            paymentStatus: "unpaid"
        });

        return res.status(201).json({
            success: true,
            message:
                "Hotel booking created successfully",
            booking
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            user: req.user._id
        })
            .populate(
                "trip",
                "title startDate endDate totalAmount status"
            )
            .populate(
                "hotel",
                "name city address image images"
            )
            .populate(
                "room",
                "roomNumber roomType pricePerNight maxGuests"
            )
            .sort({
                createdAt: -1
            });

        return res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getBooking = async (req, res) => {
    try {
        const booking =
            await Booking.findOne({
                _id: req.params.bookingId,
                user: req.user._id
            })
                .populate("trip")
                .populate(
                    "hotel",
                    "name city address image images"
                )
                .populate(
                    "room",
                    "roomNumber roomType pricePerNight maxGuests amenities images"
                );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        return res.json({
            success: true,
            booking
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createBooking,
    createHotelBooking,
    getMyBookings,
    getBooking
};