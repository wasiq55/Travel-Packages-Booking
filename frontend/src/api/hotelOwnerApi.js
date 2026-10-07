import api from "./axios";

export const getCities = async () => {
    const response = await api.get("/cities");

    return response.data;
};

export const createHotel = async (hotelData) => {
    const response = await api.post("/hotels", hotelData);

    return response.data;
};

export const getMyHotel = async () => {
    const response = await api.get("/hotels/my-hotel");

    return response.data;
};

export const updateMyHotel = async (hotelData) => {
    const response = await api.put("/hotels/my-hotel", hotelData);

    return response.data;
};