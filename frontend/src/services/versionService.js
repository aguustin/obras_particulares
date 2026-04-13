import api from './api';

export const getVersionesByPlano = (planoId) => api.get(`/versiones/plano/${planoId}`);
export const getVersion = (id) => api.get(`/versiones/${id}`);
export const getDownloadUrl = (id) => api.get(`/versiones/${id}/download`);

export const uploadVersion = (planoId, formData) =>
  api.post(`/versiones/plano/${planoId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const addObservacion = (versionId, formData) =>
  api.post(`/versiones/${versionId}/observacion`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const addComentario = (versionId, mensaje) =>
  api.post(`/versiones/${versionId}/comentario`, { mensaje });
