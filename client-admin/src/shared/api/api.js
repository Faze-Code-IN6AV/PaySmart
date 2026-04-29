import axios from '../utils/axios.js';
import { useAuthStore } from '../../features/auth/store/authStore.js';

// Instancias Axios por servicio
const axiosAuth = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

const axiosAdmin = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

const axiosAccount = axios.create({
  baseURL: import.meta.env.VITE_ACCOUNT_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptores de request — inyectan el token Bearer
axiosAdmin.interceptors.request.use((config) => {
  config._axiosClient = 'admin';
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosAuth.interceptors.request.use((config) => {
  config._axiosClient = 'auth';
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosAccount.interceptors.request.use((config) => {
  config._axiosClient = 'account';
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Lógica de manejo de token expirado
let _isRefreshing = false;
let failedQueue = [];

function _processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  failedQueue = [];
}

const handleExpiredSession = (error) => {
  _processQueue(error, null);
  useAuthStore.getState().logout();
  return Promise.reject(error);
};

const handleResponseError = async (error) => {
  const original = error.config;
  if (!original || original._retry) return Promise.reject(error);

  const status = error.response?.status;
  const isAuthEndpoint =
    original.url?.includes('/auth/login') ||
    original.url?.includes('/auth/register') ||
    original.url?.includes('/auth/refresh');

  if (status === 401 && !isAuthEndpoint) {
    original._retry = true;
    return handleExpiredSession(error);
  }

  return Promise.reject(error);
};

axiosAuth.interceptors.response.use((res) => res, handleResponseError);
axiosAdmin.interceptors.response.use((res) => res, handleResponseError);
axiosAccount.interceptors.response.use((res) => res, handleResponseError);

export { axiosAdmin, axiosAuth, axiosAccount };