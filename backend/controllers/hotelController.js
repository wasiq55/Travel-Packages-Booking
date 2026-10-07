const Hotel = require("../models/Hotel");
const City = require("../models/City");

const createHotel = async (req, res) => {
    try {
        const {
            name,
            city,
            description,
            address,
            phone,
            email,
            images,
            amenities,
            checkInTime,
            checkOutTime
        } = req.body;

        if (!name || !city || !address) {
            return res.status(400).json({
                success: false,
                message: "Hotel name, city and address are required"
            });
        }

        const cityExists = await City.findById(city);

        if (!cityExists) {
            return res.status(404).json({
                success: false,
                message: "City not found"
            });
        }

        const existingHotel = await Hotel.findOne({
            owner: req.user._id,
            name
        });

        if (existingHotel) {
            return res.status(400).json({
                success: false,
                message: "You already have a hotel with this name"
            });
        }

        const hotel = await Hotel.create({
            name,
            owner: req.user._id,
            city,
            description,
            address,
            phone,
            email,
            images: images || [],
            amenities: amenities || [],
            checkInTime: checkInTime || "12:00",
            checkOutTime: checkOutTime || "11:00"
        });

        res.status(201).json({
            success: true,
            message: "Hotel submitted for admin approval",
            hotel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getMyHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({
            owner: req.user._id
        }).populate("city", "name");

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }

        res.json({
            success: true,
            hotel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateMyHotel = async (req, res) => {
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

        const allowedFields = [
            "name",
            "description",
            "address",
            "phone",
            "email",
            "images",
            "amenities",
            "checkInTime",
            "checkOutTime"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                hotel[field] = req.body[field];
            }
        });

        await hotel.save();

        res.json({
            success: true,
            message: "Hotel updated successfully",
            hotel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getApprovedHotels = async (req, res) => {
    try {
        const filter = {
            isApproved: true,
            isActive: true
        };

        if (req.query.city) {
            filter.city = req.query.city;
        }

        const hotels = await Hotel.find(filter)
            .populate("city", "name")
            .sort({ rating: -1, name: 1 });

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

const getHotelById = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({
            _id: req.params.hotelId,
            isApproved: true,
            isActive: true
        }).populate("city", "name");

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }

        res.json({
            success: true,
            hotel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAllHotelsForAdmin = async (req, res) => {
    try {
        const hotels = await Hotel.find()
            .populate("city", "name")
            .populate("owner", "name email")
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
        const hotel = await Hotel.findById(req.params.hotelId);

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
        const hotel = await Hotel.findById(req.params.hotelId);

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
            message: "Hotel rejected successfully",
            hotel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createHotel,
    getMyHotel,
    updateMyHotel,
    getApprovedHotels,
    getHotelById,
    getAllHotelsForAdmin,
    approveHotel,
    rejectHotel
};
