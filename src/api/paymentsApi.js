import API from './axiosInstance';

// createPaymentIntent funksiyasının düzgün forması
export const createPaymentIntent = (type, carId) =>
    API.post(`/Payments/create-checkout?carId=${carId}`,
        JSON.stringify(type), // Əgər backend birbaşa string/enum gözləyirsə
        { headers: { 'Content-Type': 'application/json' } }
    );
export const createAuctionHold = (carId) => API.post(`/Payments/create-auction-hold?carId=${carId}`);
export const confirmPayment = (sessionId, carId, type) => API.get(`/Payments/verify-success?sessionId=${sessionId}&carId=${carId}&type=${type}`);
export const createAuctionFee = (carId) => API.post(`/Payments/create-auction-fee/${carId}`);
export const confirmAuctionPayment = (carId) => API.post(`/Payments/confirm-auction-payment/${carId}`);
