import api from './api';

export const getPlanosByExpediente = (expedienteId) => api.get(`/planos/expediente/${expedienteId}`);
export const getPlano = (id) => api.get(`/planos/${id}`);
export const getDashboard = (params = {}) => api.get('/planos/dashboard', { params });
export const createPlano = (data) => api.post('/planos', data);
export const updatePlano = (id, data) => api.put(`/planos/${id}`, data);
export const assignPlano = (id, data) => api.patch(`/planos/${id}/assign`, data);
export const deletePlano = (id) => api.delete(`/planos/${id}`);

export const buscarExpediente = (numero) =>
  api.get('/planos/buscar', { params: { numero } });

export const cargaInicial = (formData) =>
  api.post('/planos/carga-inicial', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
