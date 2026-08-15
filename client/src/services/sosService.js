import api from './api';

export const triggerSOS = (d) => api.post('/sos/trigger', d).then((r) => r.data);
export const resolveSOS = (status) => api.post('/sos/resolve', { status }).then((r) => r.data);
export const getSOSLogs = () => api.get('/sos/logs').then((r) => r.data);
export const getActiveSOS = () => api.get('/sos/active').then((r) => r.data);
export const triggerPublicSOS = (data) =>
  api.post('/sos/public-trigger', data).then((r) => r.data);
