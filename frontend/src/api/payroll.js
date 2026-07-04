import api from './axios';

// Employee
export const getMyPayroll = () => api.get('/payroll/me');

// Admin
export const getAllPayroll = () => api.get('/payroll');
export const getPayrollByUserId = (userId) => api.get(`/payroll/${userId}`);
export const createPayroll = (data) => api.post('/payroll', data);
export const updatePayroll = (id, data) => api.put(`/payroll/${id}`, data);
