import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const getHotelFoodPackages = async (hotelId) => {
    const response = await axios.get(
        `${API_URL}/food/hotel/${hotelId}`
    );

    return response.data;
};