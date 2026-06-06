import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginRequest } from '../../../shared/api';
import { getProfile } from '../../../shared/api/auth.js';
import { showError } from '../../../shared/utils/toast.js';
import { useAccountStore } from '../../account/store/accountStore.js';

const ALLOWED_ROLES = ['ADMIN_ROLE', 'USER_ROLE'];
const SESSION_DURATION_MS = 10 * 60 * 1000; // 10 minutos

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

      /**
       * Extiende la sesión 10 minutos desde ahora al detectar actividad.
       * No hace llamada al backend — solo actualiza expiresAt en el store.
       */
      refreshSession: () => {
        if (!get().token) return;
        const newExpiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
        set({ expiresAt: newExpiresAt });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          expiresAt: null,
          isAuthenticated: false,
        });
        useAccountStore.getState().clearSearch();
        window.location.href = '/';
      },

      login: async ({ emailOrUsername, password }) => {
        try {
          set({ loading: true, error: null });
          const { data } = await loginRequest({ emailOrUsername, password });

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

          try {
            const profileRes = await getProfile();
            const fullProfile = profileRes.data?.data ?? profileRes.data;
            if (fullProfile) {
              set((state) => ({ user: { ...state.user, ...fullProfile } }));
            }
          } catch {
            // No bloquear el login si falla cargar el perfil completo
          }

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

      setUser: (updatedUser) => set({ user: updatedUser }),
    }),
    { name: 'auth-PS-store' }
  )
);