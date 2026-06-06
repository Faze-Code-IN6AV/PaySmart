import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx';
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage.jsx';
import { EditMyProfilePage } from '../../features/auth/pages/EditMyProfilePage.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { RoleGuard } from './RoleGuard.jsx';
import { DashboardLayout } from '../layouts/DashboardLayout.jsx';
import { AccountPage } from '../../features/account/pages/AccountPage.jsx';
import { TransactionPage } from '../../features/transaction/pages/TransactionPage.jsx';
import { ProductPage } from '../../features/product/pages/ProductPage.jsx';
import { FavoriteAccountPage } from '../../features/favoriteaccount/pages/FavoriteAccountPage.jsx';
import { ReportPage } from '../../features/report/pages/ReportPage.jsx';
import { AdminClientsPage } from '../../features/clients/pages/AdminClientsPage.jsx';

// ── Constantes de roles ──────────────────────────────────────────────────────
const ADMIN = ['ADMIN_ROLE'];
const USER  = ['ADMIN_ROLE', 'USER_ROLE'];

export const AppRouter = () => {
  return (
    <Routes>
      {/* Públicas */}
      <Route path='/' element={<AuthPage />} />
      <Route path='/reset-password' element={<ResetPasswordPage />} />

      {/* Protegidas — requieren sesión activa */}
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Accesibles para todos los usuarios autenticados */}
        <Route index                  element={<RoleGuard allowedRoles={USER}><ReportPage /></RoleGuard>} />
        <Route path='accounts'        element={<RoleGuard allowedRoles={USER}><AccountPage /></RoleGuard>} />
        <Route path='transactions'    element={<RoleGuard allowedRoles={USER}><TransactionPage /></RoleGuard>} />
        <Route path='products'        element={<RoleGuard allowedRoles={USER}><ProductPage /></RoleGuard>} />
        <Route path='favorites'       element={<RoleGuard allowedRoles={USER}><FavoriteAccountPage /></RoleGuard>} />
        <Route path='profile'         element={<RoleGuard allowedRoles={USER}><EditMyProfilePage /></RoleGuard>} />

        {/* Exclusiva Admin */}
        <Route path='clients'         element={<RoleGuard allowedRoles={ADMIN}><AdminClientsPage /></RoleGuard>} />
      </Route>

      {/* Fallback */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
};