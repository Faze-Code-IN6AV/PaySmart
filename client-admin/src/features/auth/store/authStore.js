import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginRequest, register as registerRequest } from '../../../shared/api';
import { showError } from '../../../shared/utils/toast.js';
import { useAccountStore } from '../../account/store/accountStore.js';

const ALLOWED_ROLES = ['ADMIN_ROLE', 'USER_ROLE'];

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      expiresAt: null,
      loading: false,
      error: null,
      isLoadingAuth: true,
      isAuthenticated: false,

      // Verifica si hay sesión activa con un rol válido y que no haya expirado
      checkAuth: () => {
        const token = get().token;
        const role = get().user?.role;
        const expiresAt = get().expiresAt;
        const hasValidRole = ALLOWED_ROLES.includes(role);

        // Sesión expirada — limpiar y salir
        if (token && expiresAt && new Date(expiresAt) < new Date()) {
          get().logout();
          return;
        }

        // Token presente pero sin rol válido
        if (token && !hasValidRole) {
          set({
            user: null,
            token: null,
            expiresAt: null,
            isAuthenticated: false,
            isLoadingAuth: false,
            error: 'No tienes permisos para acceder a esta aplicación',
          });
          return;
        }

        set({
          isLoadingAuth: false,
          isAuthenticated: Boolean(token) && hasValidRole,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          expiresAt: null,
          isAuthenticated: false,
        });
        useAccountStore.getState().clearSearch();
        // Redirigir al login independientemente de dónde se llame el logout
        // (desde interceptor de axios, checkAuth, o botón manual)
        window.location.href = '/';
      },

      login: async ({ emailOrUsername, password }) => {
        try {
          set({ loading: true, error: null });
          const { data } = await loginRequest({ emailOrUsername, password });

          // El backend de PaySmart retorna: { success, message, token, userDetails, expiresAt }
          const role = data?.userDetails?.role;

          if (!ALLOWED_ROLES.includes(role)) {
            const message = 'No tienes permisos para acceder a esta aplicación';
            set({
              user: null,
              token: null,
              expiresAt: null,
              isAuthenticated: false,
              isLoadingAuth: false,
              error: message,
              loading: false,
            });
            showError(message);
            return { success: false, error: message };
          }

          set({
            user: data.userDetails,
            token: data.token,
            expiresAt: data.expiresAt,
            isAuthenticated: true,
            isLoadingAuth: false,
            loading: false,
            error: null,
          });

          return { success: true, role };
        } catch (err) {
          const message = err.response?.data?.message || 'Error al iniciar sesión';
          set({ error: message, loading: false });
          return { success: false, error: message };
        }
      },

      register: async (formData) => {
        try {
          set({ loading: true, error: null });
          const { data } = await registerRequest(formData);
          set({ loading: false });
          return {
            success: true,
            emailVerificationRequired: data?.emailVerificationRequired ?? true,
            data,
          };
        } catch (err) {
          const message = err.response?.data?.message || 'Error al registrar usuario';
          set({ error: message, loading: false });
          return { success: false, error: message };
        }
      },
    }),
    { name: 'auth-PS-store' }
  )
);