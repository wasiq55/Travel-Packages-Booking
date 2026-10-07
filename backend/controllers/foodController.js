const FoodPackage = require("../models/FoodPackage");
const Hotel = require("../models/Hotel");

const addFoodPackage = async (req, res) => {
    try {
        const {
            hotelId,
            title,
            mealType,
            foodType,
            pricePerPerson,
            description,
            image,
            menuItems,
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

        const foodPackage = await FoodPackage.create({
            hotel: hotelId,
            title,
            mealType,
            foodType: foodType || "veg",
            pricePerPerson,
            description,
            image,
            menuItems: menuItems || [],
            isAvailable: isAvailable ?? true
        });

        res.status(201).json({
            success: true,
            message: "Food package added successfully",
            foodPackage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getMyFoodPackages = async (req, res) => {
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

        const foodPackages = await FoodPackage.find({
            hotel: hotel._id
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            foodPackages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateFoodPackage = async (req, res) => {
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

        const foodPackage = await FoodPackage.findOne({
            _id: req.params.foodId,
            hotel: hotel._id
        });

        if (!foodPackage) {
            return res.status(404).json({
                success: false,
                message: "Food package not found"
            });
        }

        const allowedFields = [
            "title",
            "mealType",
            "foodType",
            "pricePerPerson",
            "description",
            "image",
            "menuItems",
            "isAvailable"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                foodPackage[field] = req.body[field];
            }
        });

        await foodPackage.save();

        res.json({
            success: true,
            message: "Food package updated successfully",
            foodPackage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteFoodPackage = async (req, res) => {
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

        const foodPackage = await FoodPackage.findOneAndDelete({
            _id: req.params.foodId,
            hotel: hotel._id
        });

        if (!foodPackage) {
            return res.status(404).json({
                success: false,
                message: "Food package not found"
            });
        }

        res.json({
            success: true,
            message: "Food package deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getHotelFoodPackages = async (req, res) => {
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

        const foodPackages = await FoodPackage.find({
            hotel: hotel._id,
            isAvailable: true
        }).sort({ mealType: 1 });

        res.json({
            success: true,
            foodPackages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    addFoodPackage,
    getMyFoodPackages,
    updateFoodPackage,
    deleteFoodPackage,
    getHotelFoodPackages
};