import api from './api';

export const getPadrones = (params = {}) => api.get('/padrones', { params });
export const getPadron = (id) => api.get(`/padrones/${id}`);
export const createPadron = (data) => api.post('/padrones', data);
export const updatePadron = (id, data) => api.put(`/padrones/${id}`, data);
export const deletePadron = (id) => api.delete(`/padrones/${id}`);
