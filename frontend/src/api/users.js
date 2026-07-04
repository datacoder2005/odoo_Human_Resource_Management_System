import api from './axios';

// Current user
export const getMe = () => api.get('/users/me');
export const updateMe = (data) => api.put('/users/me', data);

// Admin-only
export const getAllUsers = () => api.get('/users');
export const getUserById = (id) => api.get(`/users/${id}`);
export const updateUserById = (id, data) => api.put(`/users/${id}`, data);
