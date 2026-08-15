import api from './api';

export const register = (data) => api.post('/auth/register', data).then((r) => r.data);
export const login = (data) => api.post('/auth/login', data).then((r) => r.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data);
export const resetPassword = (data) => api.post('/auth/reset-password', data).then((r) => r.data);
export const getDashboardStats = () => api.get('/users/dashboard-stats').then((r) => r.data);
export const updateProfile = (data) => api.put('/users/profile', data).then((r) => r.data);
export const changePassword = (data) => api.put('/users/password', data).then((r) => r.data);
export const updateSettings = (data) => api.put('/users/settings', data).then((r) => r.data);
export const getProfile = () => api.get('/users/profile').then((r) => r.data);