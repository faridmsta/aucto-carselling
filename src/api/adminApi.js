import API from './axiosInstance';

export const getDashboardStats = () => API.get('/Admin/dashboard-stats');
export const deleteCarByAdmin = (carId) => API.delete(`/Admin/delete-car/${carId}`);
export const banUser = (userId) => API.post(`/Admin/ban-user/${userId}`);
export const unbanUser = (userId) => API.post(`/Admin/unban-user/${userId}`);
export const addBrand = (data) => API.post('/Admin/add-brand', data);
export const deleteBrandAdmin = (brandId) => API.delete(`/Admin/delete-brand/${brandId}`);
export const addModel = (data) => API.post('/Admin/add-model', data);
export const deleteModelAdmin = (modelId) => API.delete(`/Admin/delete-model/${modelId}`);
export const getUsers = () => API.get('/Admin/users');
