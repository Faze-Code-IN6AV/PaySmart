import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx';
import { VerifyEmailPage } from '../../features/auth/pages/VerifyEmailPage.jsx';
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { DashboardLayout } from '../layouts/DashboardLayout.jsx';
import { AccountPage } from '../../features/account/pages/AccountPage.jsx';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas públicas de auth */}
      <Route path='/' element={<AuthPage />} />
      <Route path='/verify-email' element={<VerifyEmailPage />} />
      <Route path='/reset-password' element={<ResetPasswordPage />} />

      {/* Rutas protegidas dentro del DashboardLayout */}
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* /dashboard — índice temporal */}
        <Route
          index
          element={
            <div className='flex flex-col items-center justify-center h-64'>
              <p className='text-lg font-semibold' style={{ color: 'rgba(255,255,255,0.5)' }}>
                Dashboard — en construcción 
              </p>
              <p className='text-sm mt-2' style={{ color: 'rgba(255,255,255,0.3)' }}>
                Selecciona una sección del menú lateral
              </p>
            </div>
          }
        />

        {/* /dashboard/accounts — AccountPage (ADMIN_ROLE y USER_ROLE) */}
        <Route path='accounts' element={<AccountPage />} />
      </Route>

      {/* Fallback */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
};