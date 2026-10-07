import api from "./axios";

export const getAllHotelsForAdmin = async () => {
    const response = await api.get("/hotels/admin/all");
    return response.data;
};

export const approveHotel = async (hotelId) => {
    const response = await api.put(
        `/hotels/admin/${hotelId}/approve`
    );
    return response.data;
};

export const rejectHotel = async (hotelId) => {
    const response = await api.put(
        `/hotels/admin/${hotelId}/reject`
    );
    return response.data;
};