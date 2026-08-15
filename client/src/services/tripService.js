import api from './api';

export const startTrip = (d) => api.post('/trips/start', d).then((r) => r.data);
export const getTrips = () => api.get('/trips').then((r) => r.data);
export const getActiveTrip = () => api.get('/trips/active').then((r) => r.data);
export const updateLocation = (id, d) => api.patch(`/trips/${id}/location`, d).then((r) => r.data);
export const pauseTrip = (id) => api.patch(`/trips/${id}/pause`).then((r) => r.data);
export const resumeTrip = (id) => api.patch(`/trips/${id}/resume`).then((r) => r.data);
export const endTrip = (id) => api.patch(`/trips/${id}/end`).then((r) => r.data);
export const emergencyStop = (id) => api.patch(`/trips/${id}/emergency`).then((r) => r.data);
export const deleteTrip = (id) => api.delete(`/trips/${id}`).then((r) => r.data);
