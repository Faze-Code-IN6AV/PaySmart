import axios from '../utils/axios.js';
import { useAuthStore } from '../../features/auth/store/authStore.js';

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

const axiosTransaction = axios.create({
  baseURL: import.meta.env.VITE_TRANSACTION_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

const axiosProduct = axios.create({
  baseURL: import.meta.env.VITE_PRODUCT_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptores de request
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

axiosTransaction.interceptors.request.use((config) => {
  config._axiosClient = 'transaction';
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosProduct.interceptors.request.use((config) => {
  config._axiosClient = 'product';
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// LÃ³gica de manejo de token expirado
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
    original.url?.includes('/auth/refresh');

  if (status === 401 && !isAuthEndpoint) {
    original._retry = true;
    return handleExpiredSession(error);
  }

  // Asegurarse de que el mensaje del backend llegue al catch del llamador
  // El backend retorna { success, message, errorCode } — lo preservamos aquí
  if (error.response?.data?.message && !error.response.data.message.includes('unexpected')) {
    error.message = error.response.data.message;
  }

  return Promise.reject(error);
};

const axiosFavorite = axios.create({
  baseURL: import.meta.env.VITE_FAVORITE_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

const axiosReport = axios.create({
  baseURL: import.meta.env.VITE_REPORT_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

axiosFavorite.interceptors.request.use((config) => {
  config._axiosClient = 'favorite';
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosReport.interceptors.request.use((config) => {
  config._axiosClient = 'report';
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosAuth.interceptors.response.use((res) => res, handleResponseError);
axiosAdmin.interceptors.response.use((res) => res, handleResponseError);
axiosAccount.interceptors.response.use((res) => res, handleResponseError);
axiosTransaction.interceptors.response.use((res) => res, handleResponseError);
axiosProduct.interceptors.response.use((res) => res, handleResponseError);
axiosFavorite.interceptors.response.use((res) => res, handleResponseError);
axiosReport.interceptors.response.use((res) => res, handleResponseError);

export { axiosAdmin, axiosAuth, axiosAccount, axiosTransaction, axiosProduct, axiosFavorite, axiosReport };