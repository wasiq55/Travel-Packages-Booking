
const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    createTrip,
    getMyTrips,
    getTrip,
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
    selectTripHotel,
    saveTripRideSelections
} = require("../controllers/tripController");

router.use(protect, authorize("user"));

router.post("/", createTrip);

router.get("/my-trips", getMyTrips);

router.get("/:tripId/summary", getTripSummary);

router.get("/:tripId", getTrip);

router.put("/:tripId", updateTrip);

router.delete("/:tripId", deleteTrip);

router.post("/:tripId/cities/bulk", addMultipleCities);

router.post("/:tripId/cities", addCityToTrip);

router.post("/:tripId/generate-itinerary", generateItinerary);

router.put("/:tripId/cities/:tripCityId", updateTripCity);

router.delete("/:tripId/cities/:tripCityId", removeCityFromTrip);

router.put("/:tripId/rides", saveTripRideSelections);

router.post(
    "/:tripId/cities/:tripCityId/places/bulk",
    addMultiplePlacesToTripCity
);

router.post(
    "/:tripId/cities/:tripCityId/places",
    addPlaceToTripCity
);

router.delete(
    "/:tripId/cities/:tripCityId/places/:placeId",
    removePlaceFromTripCity
);

router.put(
    "/:tripId/cities/:tripCityId/hotel",
    selectTripHotel
);

module.exports = router;