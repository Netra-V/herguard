import api from './api';

export const getIncidents = (params) => api.get('/incidents', { params }).then((r) => r.data);
export const getNearby = (params) => api.get('/incidents/nearby', { params }).then((r) => r.data);
export const getMyReports = () => api.get('/incidents/my/reports').then((r) => r.data);
export const getIncident = (id) => api.get(`/incidents/${id}`).then((r) => r.data);
export const submitReport = (formData) =>
  api.post('/incidents', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
export const deleteIncident = (id) => api.delete(`/incidents/${id}`).then((r) => r.data);
