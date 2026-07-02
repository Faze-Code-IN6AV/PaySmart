// /Users/diego/Tareas/Taller/PaySmart/client-user/src/shared/api/httpClient.js
import { create } from "axios";

import { useAuthStore } from "../store/authStore";

const createClient = create;

export function createHttpClient(baseURL) {
  const client = createClient({
    baseURL,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error?.response?.status;
      const url = error?.config?.url || "";
      const isAuthRoute = /\/auth\//.test(url) || url.includes("/login") || url.includes("/register") || url.includes("/forgot-password") || url.includes("/reset-password") || url.includes("/verify-email") || url.includes("/resend-verification");

      if (status === 401 && !isAuthRoute) {
        await useAuthStore.getState().logout();
      }

      return Promise.reject(error);
    }
  );

  return client;
}
