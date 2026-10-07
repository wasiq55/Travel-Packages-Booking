
import api from "./axios";

export const createTripBooking = async (tripId) => {
    const response = await api.post(`/bookings/trip/${tripId}`);
    return response.data;
};

export const getMyBookings = async () => {
    const response = await api.get("/bookings/my-bookings");
    return response.data;
};

export const getBooking = async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
};