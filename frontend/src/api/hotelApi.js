
import api from "./axios";

export const getHotelsByCity = async (cityId) => {
    const response = await api.get("/hotels", {
        params: {
            city: cityId
        }
    });

    return response.data;
};

export const getApprovedHotels = async (cityId) => {
    const response = await api.get("/hotels", {
        params: {
            city: cityId
        }
    });

    return response.data;
};

export const getHotelRooms = async (hotelId) => {
    const response = await api.get(`/rooms/hotel/${hotelId}`);

    return response.data;
};

export const selectTripHotel = async (
    tripId,
    tripCityId,
    hotelId,
    roomId,
    foodPackageId = null
) => {
    const response = await api.put(
        `/trips/${tripId}/cities/${tripCityId}/hotel`,
        {
            hotelId,
            roomId,
            foodPackageId
        }
    );

    return response.data;
};

export const removeTripHotel = async (tripId, tripCityId) => {
    const response = await api.delete(
        `/trips/${tripId}/cities/${tripCityId}/hotel`
    );

    return response.data;
};