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
      {/* Rutas públicas */}
      <Route path='/' element={<AuthPage />} />
      <Route path='/verify-email' element={<VerifyEmailPage />} />
      <Route path='/reset-password' element={<ResetPasswordPage />} />

      {/* Rutas protegidas */}
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <div className='flex flex-col items-center justify-center h-64'>
              <p className='text-lg font-semibold' style={{ color: 'rgba(255,255,255,0.5)' }}>
                Dashboard — en construcción 
              </p>
            </div>
          }
        />
        <Route path='accounts' element={<AccountPage />} />
      </Route>

      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
};
