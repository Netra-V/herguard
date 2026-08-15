import api from './api';

export const getContacts = () => api.get('/contacts').then((r) => r.data);
export const addContact = (d) => api.post('/contacts', d).then((r) => r.data);
export const updateContact = (id, d) => api.put(`/contacts/${id}`, d).then((r) => r.data);
export const deleteContact = (id) => api.delete(`/contacts/${id}`).then((r) => r.data);
export const setPrimary = (id) => api.patch(`/contacts/${id}/primary`).then((r) => r.data);