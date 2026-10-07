const Hotel = require("../models/Hotel");

const getPendingHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find({
            isApproved: false
        })
            .populate("owner", "name email phone")
            .populate("city", "name")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            hotels
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAllHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find()
            .populate("owner", "name email phone")
            .populate("city", "name")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            hotels
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const approveHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(
            req.params.hotelId
        );

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }

        hotel.isApproved = true;
        hotel.isActive = true;

        await hotel.save();

        res.json({
            success: true,
            message: "Hotel approved successfully",
            hotel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const rejectHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(
            req.params.hotelId
        );

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }

        hotel.isApproved = false;
        hotel.isActive = false;

        await hotel.save();

        res.json({
            success: true,
            message: "Hotel rejected successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deactivateHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(
            req.params.hotelId
        );

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }

        hotel.isActive = false;

        await hotel.save();

        res.json({
            success: true,
            message: "Hotel deactivated successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const activateHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(
            req.params.hotelId
        );

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }

        if (!hotel.isApproved) {
            return res.status(400).json({
                success: false,
                message: "Hotel must be approved first"
            });
        }

        hotel.isActive = true;

        await hotel.save();

        res.json({
            success: true,
            message: "Hotel activated successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getPendingHotels,
    getAllHotels,
    approveHotel,
    rejectHotel,
    deactivateHotel,
    activateHotel
};