
import api from "./axios";

export const createPaymentOrder = async (bookingId) => {
    const response = await api.post(`/payments/create-order/${bookingId}`);
    return response.data;
};

export const verifyPayment = async (paymentData) => {
    const response = await api.post("/payments/verify", paymentData);
    return response.data;
};