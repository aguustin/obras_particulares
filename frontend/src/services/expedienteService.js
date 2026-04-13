import api from './api';

export const getExpedientes = (params = {}) => api.get('/expedientes', { params });
export const getExpedientesByPadron = (padronId) => api.get(`/expedientes/padron/${padronId}`);
export const getExpediente = (id) => api.get(`/expedientes/${id}`);
export const createExpediente = (data) => api.post('/expedientes', data);
export const updateExpediente = (id, data) => api.put(`/expedientes/${id}`, data);
export const deleteExpediente = (id) => api.delete(`/expedientes/${id}`);
