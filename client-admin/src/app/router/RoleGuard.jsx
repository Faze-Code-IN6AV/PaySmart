import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore.js';

/**
 * RoleGuard — permite el acceso solo a los roles especificados en `allowedRoles`.
 * Uso: <RoleGuard allowedRoles={['ADMIN_ROLE']}> ... </RoleGuard>
 * Si el usuario está autenticado pero no tiene el rol, redirige al dashboard.
 */
export const RoleGuard = ({ children, allowedRoles = [] }) => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const hasAccess = isAuthenticated && allowedRoles.includes(user?.role);

  if (!hasAccess) {
    return <Navigate to='/dashboard' replace />;
  }

  return children;
};
