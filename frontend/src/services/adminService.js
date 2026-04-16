import api from './api';

export const downloadBackup = async () => {
  const res = await api.get('/admin/backup', { responseType: 'blob' });
  const fecha = new Date().toISOString().slice(0, 10);
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `obras-backup-${fecha}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const getTecnicos = () => api.get('/admin/tecnicos');
export const approveTecnico = (id) => api.post(`/admin/tecnicos/${id}/approve`);
export const rejectTecnico = (id) => api.delete(`/admin/tecnicos/${id}/reject`);
export const toggleActivo = (id) => api.patch(`/admin/tecnicos/${id}/toggle`);
export const updatePermisos = (id, permisos_planos) =>
  api.patch(`/admin/tecnicos/${id}/permisos`, { permisos_planos });
