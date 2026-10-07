
import api from "./axios";

export const getTransportOptions = async (params = {}) => {
    const response = await api.get("/transport", { params });
    return response.data;
};

export const selectTripTransport = async (tripId, transportId) => {
    const response = await api.post(`/transport/trip/${tripId}`, {
        transportId
    });
    return response.data;
};

export const removeTripTransport = async (tripId, transportId) => {
    const response = await api.delete(
        `/transport/trip/${tripId}/${transportId}`
    );
    return response.data;
};

export const saveTripRideSelections = async (tripId, rides) => {
    const response = await api.put(`/trips/${tripId}/rides`, {
        rides
    });
    return response.data;
};