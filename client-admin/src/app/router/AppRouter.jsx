import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx';
import { VerifyEmailPage } from '../../features/auth/pages/VerifyEmailPage.jsx';
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
// import { RoleGuard } from './RoleGuard.jsx';
// import { DashboardPage } from '../layouts/DashboardPage.jsx';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas públicas de auth */}
      <Route path='/' element={<AuthPage />} />
      <Route path='/verify-email' element={<VerifyEmailPage />} />
      <Route path='/reset-password' element={<ResetPasswordPage />} />

      {/* Rutas protegidas — descomenta y agrega tus layouts cuando los tengas */}
      <Route
        path='/dashboard/*'
        element={
          <ProtectedRoute>
            {/* Ejemplo de cómo separar vistas por rol dentro del mismo dashboard:
                <RoleGuard allowedRoles={['ADMIN_ROLE', 'USER_ROLE']}>
                  <DashboardPage />
                </RoleGuard>
            */}
            <div style={{ color: '#fff', padding: 40 }}>Dashboard — en construcción 🚧</div>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
};
