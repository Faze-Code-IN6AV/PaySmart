// /Users/diego/Tareas/Taller/PaySmart/client-user/src/shared/store/authStore.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const STORAGE_KEY = "paySmart-client-user-auth";

const authStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      login: async (token, user) => {
        set({ token, user, isAuthenticated: true });
        await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify({ token, user }));
      },

      logout: async () => {
        set({ token: null, user: null, isAuthenticated: false });
        await SecureStore.deleteItemAsync(STORAGE_KEY);
      },

      setToken: async (token) => {
        set({ token, isAuthenticated: Boolean(token) });
        const currentUser = get().user;
        if (token) {
          await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify({ token, user: currentUser }));
        } else {
          await SecureStore.deleteItemAsync(STORAGE_KEY);
        }
      },

      updateUser: async (user) => {
        set({ user });
        const currentToken = get().token;
        if (currentToken) {
          await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify({ token: currentToken, user }));
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state._hasHydrated = true;
      },
    }
  )
);

export const useAuthStore = authStore;
export default authStore;
