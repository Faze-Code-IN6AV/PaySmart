// SERVICIOS DE AUTENTICACIÓN — PaySmart Auth Service
import { axiosAuth } from './api';

// POST /api/v1/auth/login
export const login = async (data) => {
  return await axiosAuth.post('/auth/login', data);
};

// POST /api/v1/auth/register  (multipart/form-data)
export const register = async (data) => {
  return await axiosAuth.post('/auth/register', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// POST /api/v1/auth/verify-email
export const verifyEmail = async (token) => {
  return await axiosAuth.post('/auth/verify-email', { token });
};

// POST /api/v1/auth/resend-verification
export const resendVerification = async (email) => {
  return await axiosAuth.post('/auth/resend-verification', { email });
};

// POST /api/v1/auth/forgot-password
export const forgotPassword = async (email) => {
  return await axiosAuth.post('/auth/forgot-password', { email });
};

// POST /api/v1/auth/reset-password
export const resetPassword = async (token, newPassword) => {
  return await axiosAuth.post('/auth/reset-password', { token, newPassword });
};

// GET /api/v1/auth/profile  (requiere token)
export const getProfile = async () => {
  return await axiosAuth.get('/auth/profile');
}