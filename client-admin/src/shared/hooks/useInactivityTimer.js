import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../../features/auth/store/authStore.js';

const INACTIVITY_LIMIT_MS = 10 * 60 * 1000; // 10 minutos
const WARNING_BEFORE_MS = 60 * 1000;          // advertencia 1 min antes
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

/**
 * Hook que gestiona el timer de inactividad.
 * - Si el usuario no actúa en 10 min → logout.
 * - Si actúa → extiende expiresAt 10 min desde ahora.
 * - Llama a onWarning(secondsLeft) cuando quedan 60 s.
 * - Llama a onActive() cuando el usuario actúa tras la advertencia.
 */
export function useInactivityTimer({ onWarning, onActive, enabled = true }) {
  const logout = useAuthStore((s) => s.logout);
  const refreshSession = useAuthStore((s) => s.refreshSession);

  const logoutTimer = useRef(null);
  const warningTimer = useRef(null);
  const countdownRef = useRef(null);
  const warningShownRef = useRef(false);

  const clearTimers = useCallback(() => {
    clearTimeout(logoutTimer.current);
    clearTimeout(warningTimer.current);
    clearInterval(countdownRef.current);
  }, []);

  const startTimers = useCallback(() => {
    clearTimers();
    warningShownRef.current = false;

    // Timer de advertencia
    warningTimer.current = setTimeout(() => {
      warningShownRef.current = true;
      let secondsLeft = Math.round(WARNING_BEFORE_MS / 1000);
      onWarning?.(secondsLeft);

      countdownRef.current = setInterval(() => {
        secondsLeft -= 1;
        onWarning?.(secondsLeft);
        if (secondsLeft <= 0) clearInterval(countdownRef.current);
      }, 1000);
    }, INACTIVITY_LIMIT_MS - WARNING_BEFORE_MS);

    // Timer de logout
    logoutTimer.current = setTimeout(() => {
      clearTimers();
      logout();
    }, INACTIVITY_LIMIT_MS);
  }, [clearTimers, logout, onWarning]);

  const handleActivity = useCallback(() => {
    if (!enabled) return;

    // Si la advertencia ya estaba visible, notificar que el usuario reaccionó
    if (warningShownRef.current) {
      onActive?.();
    }

    refreshSession();
    startTimers();
  }, [enabled, onActive, refreshSession, startTimers]);

  useEffect(() => {
    if (!enabled) return;

    startTimers();

    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, handleActivity, { passive: true })
    );

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, handleActivity)
      );
    };
  }, [enabled, startTimers, handleActivity, clearTimers]);
}
