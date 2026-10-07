import api from "./axios";

export const createTrip = async (tripData) => {
    const response = await api.post("/trips", tripData);
    return response.data;
};

export const getMyTrips = async () => {
    const response = await api.get("/trips/my-trips");
    return response.data;
};

export const getTrip = async (tripId) => {
    const response = await api.get(`/trips/${tripId}`);
    return response.data;
};

export const updateTrip = async (tripId, tripData) => {
    const response = await api.put(`/trips/${tripId}`, tripData);
    return response.data;
};

export const addCityToTrip = async (tripId, cityData) => {
    const response = await api.post(`/trips/${tripId}/cities`, cityData);
    return response.data;
};

export const addMultipleCities = async (tripId, cities) => {
    const response = await api.post(`/trips/${tripId}/cities/bulk`, {
        cities
    });
    return response.data;
};

export const removeCityFromTrip = async (tripId, tripCityId) => {
    const response = await api.delete(
        `/trips/${tripId}/cities/${tripCityId}`
    );
    return response.data;
};

export const updateTripCity = async (tripId, tripCityId, cityData) => {
    const response = await api.put(
        `/trips/${tripId}/cities/${tripCityId}`,
        cityData
    );
    return response.data;
};

export const generateItinerary = async (tripId) => {
    const response = await api.post(
        `/trips/${tripId}/generate-itinerary`
    );
    return response.data;
};

export const addPlaceToTripCity = async (tripId, tripCityId, placeData) => {
    const response = await api.post(
        `/trips/${tripId}/cities/${tripCityId}/places`,
        placeData
    );
    return response.data;
};

export const addMultiplePlacesToTripCity = async (
    tripId,
    tripCityId,
    places
) => {
    const response = await api.post(
        `/trips/${tripId}/cities/${tripCityId}/places/bulk`,
        { places }
    );
    return response.data;
};

export const removePlaceFromTripCity = async (
    tripId,
    tripCityId,
    placeId
) => {
    const response = await api.delete(
        `/trips/${tripId}/cities/${tripCityId}/places/${placeId}`
    );
    return response.data;
};

export const deleteTrip = async (tripId) => {
    const response = await api.delete(`/trips/${tripId}`);
    return response.data;
};

export const getTripSummary = async (tripId) => {
    const response = await api.get(`/trips/${tripId}/summary`);
    return response.data;
};