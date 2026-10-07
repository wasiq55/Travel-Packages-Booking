const Room = require("../models/Room");
const Hotel = require("../models/Hotel");

const addRoom = async (req, res) => {
    try {
        const {
            hotelId,
            roomNumber,
            roomType,
            pricePerNight,
            maxGuests,
            amenities,
            images,
            isAvailable
        } = req.body;

        if (!hotelId) {
            return res.status(400).json({
                success: false,
                message: "Hotel ID is required"
            });
        }

        const hotel = await Hotel.findOne({
            _id: hotelId,
            isApproved: true,
            isActive: true
        });

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Approved and active hotel not found"
            });
        }

        const existingRoom = await Room.findOne({
            hotel: hotelId,
            roomNumber
        });

        if (existingRoom) {
            return res.status(400).json({
                success: false,
                message: "Room number already exists"
            });
        }

        const room = await Room.create({
            hotel: hotelId,
            roomNumber,
            roomType,
            pricePerNight,
            maxGuests,
            amenities: amenities || [],
            images: images || [],
            isAvailable: isAvailable ?? true
        });

        res.status(201).json({
            success: true,
            message: "Room added successfully",
            room
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getMyRooms = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({
            owner: req.user._id
        });

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }

        const rooms = await Room.find({
            hotel: hotel._id
        }).sort({ roomNumber: 1 });

        res.json({
            success: true,
            rooms
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateRoom = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({
            owner: req.user._id
        });

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }

        const room = await Room.findOne({
            _id: req.params.roomId,
            hotel: hotel._id
        });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        const allowedFields = [
            "roomNumber",
            "roomType",
            "pricePerNight",
            "maxGuests",
            "amenities",
            "images",
            "isAvailable"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                room[field] = req.body[field];
            }
        });

        await room.save();

        res.json({
            success: true,
            message: "Room updated successfully",
            room
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteRoom = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({
            owner: req.user._id
        });

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }

        const room = await Room.findOneAndDelete({
            _id: req.params.roomId,
            hotel: hotel._id
        });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        res.json({
            success: true,
            message: "Room deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getHotelRooms = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({
            _id: req.params.hotelId,
            isApproved: true,
            isActive: true
        });

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }

        const rooms = await Room.find({
            hotel: hotel._id,
            isAvailable: true
        });

        res.json({
            success: true,
            rooms
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    addRoom,
    getMyRooms,
    updateRoom,
    deleteRoom,
    getHotelRooms
};