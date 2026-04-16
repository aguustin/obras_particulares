import api from './api';

export const registerSelf = (email, password, esTecnico = false, nombre = '', apellido = '', dni = '') =>
  api.post('/auth/register-self', { email, password, esTecnico, nombre, apellido, dni });

export const verifyEmail = (token) =>
  api.get(`/auth/verify-email?token=${token}`);

export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email });

export const resetPassword = (token, password) =>
  api.post('/auth/reset-password', { token, password });
