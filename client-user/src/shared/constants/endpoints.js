// /Users/diego/Tareas/Taller/PaySmart/client-user/src/shared/constants/endpoints.js
const AUTH_URL = process.env.EXPO_PUBLIC_AUTH_URL || "http://10.0.2.2:3000/api/v1/auth";

export const ENDPOINTS = {
  AUTH: AUTH_URL,
  // Mismo microservicio que AUTH, pero sin el sufijo "/auth": ahí viven las
  // rutas /users/* (gestión de clientes) que usa el admin, igual que
  // VITE_AUTH_URL en client-admin (axiosAdmin apunta a esta misma raíz).
  AUTH_ROOT: AUTH_URL.replace(/\/auth\/?$/, ""),
  ACCOUNT: process.env.EXPO_PUBLIC_ACCOUNT_URL || "http://localhost:3001/paySmart/v1",
  TRANSACTION: process.env.EXPO_PUBLIC_TRANSACTION_URL || "http://localhost:3002/paySmart/v1",
  PRODUCT: process.env.EXPO_PUBLIC_PRODUCT_URL || "http://localhost:3003/paySmart/v1",
  FAVORITE: process.env.EXPO_PUBLIC_FAVORITE_URL || "http://localhost:3004/paySmart/v1",
};