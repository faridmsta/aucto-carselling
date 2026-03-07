import API from './axiosInstance';

export const getAllCars = () => API.get('/Cars');
export const getActiveCars = () => API.get('/Cars/active');
export const getCarById = (id) => API.get(`/Cars/${id}`);
export const getFilteredCars = (params) => API.get('/Cars/filter', { params });
export const createCarAd = (data) => API.post('/Cars/create-ad', data);
export const updateCar = (id, formData) => API.put(`/Cars/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteCar = (id) => API.delete(`/Cars/${id}`);
export const uploadCarImages = (carId, formData) => API.post(`/Cars/${carId}/upload-images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getMyCars = () => API.get('/Cars/my-cars');
export const toggleFavorite = (carId) => API.post(`/Cars/${carId}/favorite`);
export const getFavorites = () => API.get('/Cars/favorites');
export const reactivateAd = (data) => API.post('/Cars/reactivate', data);
export const getAiAdvice = (id) => API.get(`/Cars/${id}/ai-advice`);
export const getAdminCars = () => API.get('/Cars/admin/all');
