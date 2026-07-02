// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/auth/hooks/useAuth.js
import { useCallback, useMemo, useState } from "react";

import authClient from "../../../shared/api/authClient";
import { useAuthStore } from "../../../shared/store/authStore";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, logout: logoutStore } = useAuthStore();

  const handleLogin = useCallback(async (values) => {
    setLoading(true);
    setError("");

    try {
      const response = await authClient.post("/login", {
        emailOrUsername: values.emailOrUsername,
        password: values.password,
      });

      const payload = response?.data;
      if (payload?.success && payload?.token) {
        await login(payload.token, payload.userDetails);
        return { success: true };
      }

      setError(payload?.message || "No se pudo iniciar sesión.");
      return { success: false };
    } catch (err) {
      const responseMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.errors?.[0]?.message ||
        err?.message ||
        "Ocurrió un error al iniciar sesión.";

      if (__DEV__) {
        console.error("[useAuth][handleLogin] login error", {
          message: err?.message,
          responseData: err?.response?.data,
          status: err?.response?.status,
          requestUrl: `${authClient.defaults.baseURL}/login`,
        });
      }

      setError(responseMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [login]);

  const handleRegister = useCallback(async (values) => {
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("surname", values.surname);
      formData.append("username", values.username);
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("phone", values.phone);
      formData.append("dpi", values.dpi);
      formData.append("address", values.address);
      formData.append("workName", values.workName);
      formData.append("monthlyIncome", values.monthlyIncome);

      const response = await authClient.post("/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const payload = response?.data;
      if (payload?.success) {
        return { success: true, message: payload?.message || "Registro exitoso. Revise su correo para verificar su cuenta." };
      }

      setError(payload?.message || "No se pudo completar el registro.");
      return { success: false };
    } catch (err) {
      setError(err?.response?.data?.message || "Ocurrió un error al registrar la cuenta.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutStore();
  }, [logoutStore]);

  return useMemo(() => ({
    handleLogin,
    handleRegister,
    loading,
    error,
    logout,
  }), [handleLogin, handleRegister, loading, error, logout]);
}
