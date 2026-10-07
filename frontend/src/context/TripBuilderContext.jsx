
import { createContext, useContext, useEffect, useState } from "react";
import {
    getZones,
    getStatesByZone,
    getCitiesByState
} from "../api/locationApi";
import {
    createTrip,
    addMultipleCities,
    generateItinerary,
    addMultiplePlacesToTripCity
} from "../api/tripApi";

const TripBuilderContext = createContext();

const useSessionState = (key, initialValue) => {
    const [value, setValue] = useState(() => {
        try {
            const savedValue = sessionStorage.getItem(key);

            return savedValue !== null
                ? JSON.parse(savedValue)
                : initialValue;
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Unable to save ${key}:`, error);
        }
    }, [key, value]);

    return [value, setValue];
};

const getId = (item) => {
    if (typeof item === "string") return item;

    return item?._id || item?.id || item?.placeId || null;
};

const getStateId = (item) => {
    if (!item) return null;

    if (typeof item.state === "string") {
        return item.state;
    }

    return (
        item.stateId ||
        item.state?._id ||
        item.state?.id ||
        null
    );
};

const getCityId = (place) => {
    if (!place) return null;

    if (typeof place.city === "string") {
        return place.city;
    }

    return (
        place.cityId ||
        place.city?._id ||
        place.city?.id ||
        null
    );
};

const sameId = (first, second) => {
    if (!first || !second) return false;

    return String(first) === String(second);
};

const getArrayData = (data, key) => {
    if (Array.isArray(data)) return data;

    if (Array.isArray(data?.[key])) return data[key];

    if (Array.isArray(data?.data?.[key])) {
        return data.data[key];
    }

    if (Array.isArray(data?.data)) return data.data;

    return [];
};

const getTripCityId = (tripCity) => {
    return tripCity?._id || tripCity?.id || null;
};

const getTripCityCityId = (tripCity) => {
    if (typeof tripCity?.city === "string") {
        return tripCity.city;
    }

    return tripCity?.city?._id || tripCity?.city?.id || null;
};

const getValidLocation = (location) => {
    if (!location) return null;

    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
    }

    if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        return null;
    }

    return {
        latitude,
        longitude
    };
};

const getCityLocation = (city) => {
    if (!city) return null;

    const nestedLocation =
        city.city && typeof city.city === "object"
            ? city.city.location
            : null;

    return (
        getValidLocation(nestedLocation) ||
        getValidLocation(city.location) ||
        null
    );
};

const addLocationToTripCity = (tripCity, selectedCities, cities) => {
    const cityId = getTripCityCityId(tripCity);

    const selectedCity =
        selectedCities.find((city) =>
            sameId(getId(city), cityId)
        ) ||
        cities.find((city) =>
            sameId(getId(city), cityId)
        );

    const location =
        getCityLocation(tripCity) ||
        getCityLocation(selectedCity);

    if (!location) {
        return tripCity;
    }

    const updatedTripCity = {
        ...tripCity,
        location
    };

    if (
        tripCity.city &&
        typeof tripCity.city === "object"
    ) {
        updatedTripCity.city = {
            ...tripCity.city,
            location:
                getValidLocation(tripCity.city.location) ||
                location
        };
    }

    return updatedTripCity;
};

export const TripBuilderProvider = ({ children }) => {
    const [step, setStep] = useSessionState("tripBuilder_step", 0);

    const [zones, setZones] = useSessionState("tripBuilder_zones", []);
    const [states, setStates] = useSessionState("tripBuilder_states", []);
    const [cities, setCities] = useSessionState("tripBuilder_cities", []);

    const [selectedZone, setSelectedZone] = useSessionState(
        "tripBuilder_selectedZone",
        null
    );

    const [selectedStates, setSelectedStates] = useSessionState(
        "tripBuilder_selectedStates",
        []
    );

    const [selectedCities, setSelectedCities] = useSessionState(
        "tripBuilder_selectedCities",
        []
    );

    const [selectedPlaces, setSelectedPlaces] = useSessionState(
        "tripBuilder_selectedPlaces",
        []
    );

    const [tripTitle, setTripTitle] = useSessionState(
        "tripBuilder_tripTitle",
        ""
    );

    const [startDate, setStartDate] = useSessionState(
        "tripBuilder_startDate",
        ""
    );

    const [endDate, setEndDate] = useSessionState(
        "tripBuilder_endDate",
        ""
    );

    const [travelers, setTravelers] = useSessionState(
        "tripBuilder_travelers",
        1
    );

    const [selectedHotels, setSelectedHotels] = useSessionState(
        "tripBuilder_selectedHotels",
        []
    );

    const [selectedRooms, setSelectedRooms] = useSessionState(
        "tripBuilder_selectedRooms",
        []
    );

    const [selectedTransport, setSelectedTransport] = useSessionState(
        "tripBuilder_selectedTransport",
        null
    );

    const [selectedActivities, setSelectedActivities] = useSessionState(
        "tripBuilder_selectedActivities",
        []
    );

    const [tripId, setTripId] = useSessionState(
        "tripBuilder_tripId",
        null
    );

    const [tripCities, setTripCities] = useSessionState(
        "tripBuilder_tripCities",
        []
    );

    const [tripLoading, setTripLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [selectedFoodPackages, setSelectedFoodPackages] = useSessionState(
        "tripBuilder_selectedFoodPackages",
        {}
    );

    const [foodPreferences, setFoodPreferences] = useSessionState(
        "tripBuilder_foodPreferences",
        {}
    );

    const loadZones = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getZones();
            const zoneList = getArrayData(response, "zones");

            setZones(zoneList);
        } catch (error) {
            console.error("Zone API error:", error);

            setError(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to load travel zones."
            );
        } finally {
            setLoading(false);
        }
    };

    const selectZone = async (zone) => {
        try {
            setLoading(true);
            setError("");

            const zoneId = getId(zone);

            if (!zoneId) {
                throw new Error("Zone ID not found.");
            }

            setSelectedZone(zone);
            setSelectedStates([]);
            setSelectedCities([]);
            setSelectedPlaces([]);

            setStates([]);
            setCities([]);

            setTripId(null);
            setTripCities([]);

            setSelectedHotels([]);
            setSelectedRooms([]);
            setSelectedTransport(null);
            setSelectedActivities([]);
            setSelectedFoodPackages({});
            setFoodPreferences({});

            const response = await getStatesByZone(zoneId);
            const stateList = getArrayData(response, "states");

            setStates(stateList);
            setStep(1);
        } catch (error) {
            console.error("Zone selection error:", error);

            setError(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to load states for this zone."
            );
        } finally {
            setLoading(false);
        }
    };

    const toggleState = async (state) => {
        const stateId = getId(state);

        if (!stateId) {
            console.error("State ID not found:", state);
            setError("State ID not found.");
            return;
        }

        const alreadySelected = selectedStates.some((item) =>
            sameId(getId(item), stateId)
        );

        if (alreadySelected) {
            setSelectedStates((previous) =>
                previous.filter((item) => !sameId(getId(item), stateId))
            );

            setSelectedCities((previous) =>
                previous.filter((city) => !sameId(getStateId(city), stateId))
            );

            setCities((previous) =>
                previous.filter((city) => !sameId(getStateId(city), stateId))
            );

            setSelectedPlaces((previous) =>
                previous.filter((place) => {
                    const placeStateId =
                        place.stateId ||
                        place.state?._id ||
                        place.state?.id;

                    return !sameId(placeStateId, stateId);
                })
            );

            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await getCitiesByState(stateId);

            const newCities = getArrayData(response, "cities");

            const citiesWithState = newCities.map((city) => ({
                ...city,
                stateId: String(stateId),
                state: city.state || state
            }));

            setSelectedStates((previous) => {
                const exists = previous.some((item) =>
                    sameId(getId(item), stateId)
                );

                return exists ? previous : [...previous, state];
            });

            setCities((previous) => {
                const existingIds = new Set(
                    previous.map((city) => String(getId(city)))
                );

                const filteredCities = citiesWithState.filter(
                    (city) => !existingIds.has(String(getId(city)))
                );

                return [...previous, ...filteredCities];
            });
        } catch (error) {
            console.error("Cities API error:", error);

            setError(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to load cities."
            );
        } finally {
            setLoading(false);
        }
    };

    const toggleCity = (city) => {
        const cityId = getId(city);

        if (!cityId) {
            console.error("City ID not found:", city);
            setError("City ID not found.");
            return;
        }

        setSelectedCities((previous) => {
            const exists = previous.some((item) =>
                sameId(getId(item), cityId)
            );

            if (exists) {
                setSelectedPlaces((previousPlaces) =>
                    previousPlaces.filter(
                        (place) => !sameId(getCityId(place), cityId)
                    )
                );

                return previous.filter(
                    (item) => !sameId(getId(item), cityId)
                );
            }

            return [
                ...previous,
                {
                    ...city,
                    stateId: getStateId(city),
                    state: city.state || null
                }
            ];
        });
    };

    const togglePlace = (place, cityId) => {
        const placeId = getId(place);

        const finalCityId =
            typeof cityId === "string"
                ? cityId
                : getId(cityId) || getCityId(place);

        if (!placeId) {
            console.error("Place ID is missing:", place);
            setError("Place ID is missing.");
            return;
        }

        if (!finalCityId) {
            console.error("City ID is missing:", place);
            setError("City ID is missing for a selected place.");
            return;
        }

        setSelectedPlaces((previous) => {
            const exists = previous.some((item) =>
                sameId(getId(item), placeId)
            );

            if (exists) {
                return previous.filter(
                    (item) => !sameId(getId(item), placeId)
                );
            }

            return [
                ...previous,
                {
                    ...place,
                    placeId: String(placeId),
                    cityId: String(finalCityId)
                }
            ];
        });
    };

    const updateTripDetails = ({
        title,
        start,
        end,
        travelerCount
    }) => {
        setTripTitle(title || "");
        setStartDate(start || "");
        setEndDate(end || "");
        setTravelers(Number(travelerCount) || 1);
        setError("");
    };

    const createTripAndItinerary = async () => {
        try {
            setTripLoading(true);
            setError("");

            if (!selectedZone) {
                setError("Please select a travel zone.");
                return false;
            }

            if (selectedCities.length === 0) {
                setError("Please select at least one city.");
                return false;
            }

            if (selectedPlaces.length === 0) {
                setError("Please select at least one place.");
                return false;
            }

            if (!startDate || !endDate) {
                setError("Please select both your travel start date and end date.");
                return false;
            }

            const start = new Date(startDate);
            const end = new Date(endDate);

            if (
                Number.isNaN(start.getTime()) ||
                Number.isNaN(end.getTime())
            ) {
                setError("Your travel dates are invalid. Please select them again.");
                return false;
            }

            if (end <= start) {
                setError("Your end date must be after your start date.");
                return false;
            }

            const totalNights = Math.ceil(
                (end - start) / (1000 * 60 * 60 * 24)
            );

            if (totalNights < selectedCities.length) {
                setError(
                    "Your trip needs at least one night for each selected city. Increase your travel dates or select fewer cities."
                );
                return false;
            }

            const zoneId = getId(selectedZone);

            if (!zoneId) {
                setError("The selected zone is missing its ID. Please select the zone again.");
                return false;
            }

            const selectedCityData = selectedCities.map((city) => ({
                stateId: getStateId(city),
                cityId: getId(city)
            }));

            const invalidCity = selectedCityData.find(
                (city) => !city.stateId || !city.cityId
            );

            if (invalidCity) {
                setError(
                    "A selected city is missing its state ID or city ID. Please go back and select your cities again."
                );
                return false;
            }

            const tripResponse = await createTrip({
                title: tripTitle || "My Custom Trip",
                zone: zoneId,
                startDate,
                endDate,
                adults: travelers,
                children: 0,
                rooms: 1
            });

            const newTripId =
                tripResponse?.trip?._id ||
                tripResponse?.trip?.id ||
                tripResponse?.data?.trip?._id ||
                tripResponse?.data?.trip?.id ||
                tripResponse?._id ||
                tripResponse?.id ||
                tripResponse?.data?._id ||
                tripResponse?.data?.id;

            if (!newTripId) {
                setError("The trip response did not contain a trip ID.");
                return false;
            }

            setTripId(newTripId);

            const cityResponse = await addMultipleCities(
                newTripId,
                selectedCityData
            );

            if (cityResponse?.success === false) {
                throw new Error(
                    cityResponse?.message || "Unable to add selected cities."
                );
            }

            const itineraryResponse = await generateItinerary(newTripId);

            if (itineraryResponse?.success === false) {
                throw new Error(
                    itineraryResponse?.message || "Unable to generate itinerary."
                );
            }

            const createdTripCities =
                itineraryResponse?.cities ||
                itineraryResponse?.tripCities ||
                itineraryResponse?.data?.cities ||
                itineraryResponse?.data?.tripCities ||
                cityResponse?.cities ||
                cityResponse?.tripCities ||
                cityResponse?.data?.cities ||
                cityResponse?.data?.tripCities ||
                [];

            if (
                !Array.isArray(createdTripCities) ||
                createdTripCities.length === 0
            ) {
                setError(
                    "Cities were added, but the itinerary response did not contain the trip cities."
                );
                return false;
            }

            const updatedTripCities = createdTripCities.map((tripCity) =>
                addLocationToTripCity(
                    tripCity,
                    selectedCities,
                    cities
                )
            );

            for (const tripCity of createdTripCities) {
                const tripCityId = getTripCityId(tripCity);
                const originalCityId = getTripCityCityId(tripCity);

                if (!tripCityId || !originalCityId) {
                    continue;
                }

                const placesForCity = selectedPlaces
                    .filter((place) =>
                        sameId(getCityId(place), originalCityId)
                    )
                    .map((place) => ({
                        placeId: getId(place)
                    }))
                    .filter((place) => place.placeId);

                if (placesForCity.length === 0) continue;

                const placesResponse = await addMultiplePlacesToTripCity(
                    newTripId,
                    tripCityId,
                    placesForCity
                );

                if (placesResponse?.success === false) {
                    throw new Error(
                        placesResponse?.message ||
                        "Unable to save selected places."
                    );
                }

                const updatedTripCity = placesResponse?.tripCity;

                if (updatedTripCity) {
                    const index = updatedTripCities.findIndex(
                        (item) => sameId(getTripCityId(item), tripCityId)
                    );

                    if (index !== -1) {
                        updatedTripCities[index] = {
                            ...updatedTripCities[index],
                            ...updatedTripCity
                        };
                    }
                }
            }

            const tripCitiesWithLocations = updatedTripCities.map((tripCity) =>
                addLocationToTripCity(
                    tripCity,
                    selectedCities,
                    cities
                )
            );

            const citiesWithoutCoordinates = tripCitiesWithLocations.filter(
                (tripCity) => !getCityLocation(tripCity)
            );

            if (citiesWithoutCoordinates.length > 0) {
                console.warn(
                    "Some trip cities do not have coordinates:",
                    citiesWithoutCoordinates
                );
            }

            setTripId(newTripId);
            setTripCities(tripCitiesWithLocations);

            return true;
        } catch (error) {
            console.error("Trip creation error:", error);
            console.error("Error response:", error?.response?.data);

            setError(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to create trip."
            );

            return false;
        } finally {
            setTripLoading(false);
        }
    };

    const nextStep = () => {
        setStep((previous) => Math.min(Number(previous) + 1, 7));
    };

    const previousStep = () => {
        setStep((previous) => Math.max(Number(previous) - 1, 0));
    };

    useEffect(() => {
        loadZones();
    }, []);

    return (
        <TripBuilderContext.Provider
            value={{
                step,
                setStep,

                zones,
                states,
                cities,

                selectedZone,
                selectedStates,
                selectedCities,
                selectedPlaces,

                tripTitle,
                startDate,
                endDate,
                travelers,

                selectedHotels,
                selectedRooms,
                selectedTransport,
                selectedActivities,

                tripId,
                tripCities,
                tripLoading,

                loading,
                error,

                loadZones,
                selectZone,
                toggleState,
                toggleCity,
                togglePlace,

                createTripAndItinerary,

                setSelectedZone,
                setSelectedStates,
                setSelectedCities,
                setSelectedPlaces,

                setTripTitle,
                setStartDate,
                setEndDate,
                setTravelers,

                setSelectedHotels,
                setSelectedRooms,
                setSelectedTransport,
                setSelectedActivities,

                updateTripDetails,

                nextStep,
                previousStep,

                selectedFoodPackages,
                foodPreferences,
                setSelectedFoodPackages,
                setFoodPreferences
            }}
        >
            {children}
        </TripBuilderContext.Provider>
    );
};

export const useTripBuilder = () => {
    return useContext(TripBuilderContext);
};