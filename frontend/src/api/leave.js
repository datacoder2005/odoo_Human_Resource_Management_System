import api from './axios';

export const applyLeave = (data) => api.post('/leave/apply', data);
export const getMyLeaves = () => api.get('/leave/my');
export const getAllLeaves = () => api.get('/leave/all');
export const updateLeaveStatus = (id, status) => api.put(`/leave/${id}/status`, { status });
