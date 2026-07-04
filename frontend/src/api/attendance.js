import api from './axios';

export const checkIn = () => api.post('/attendance/checkin');
export const checkOut = () => api.post('/attendance/checkout');
export const getMyAttendance = (params) => api.get('/attendance/my', { params });
export const getAllAttendance = (params) => api.get('/attendance/all', { params });
export const getAttendanceSummary = () => api.get('/attendance/summary');
