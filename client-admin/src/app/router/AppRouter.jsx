import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx';
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage.jsx';
import { EditMyProfilePage } from '../../features/auth/pages/EditMyProfilePage.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { DashboardLayout } from '../layouts/DashboardLayout.jsx';
import { AccountPage } from '../../features/account/pages/AccountPage.jsx';
import { TransactionPage } from '../../features/transaction/pages/TransactionPage.jsx';
import { ProductPage } from '../../features/product/pages/ProductPage.jsx';
import { FavoriteAccountPage } from '../../features/favoriteaccount/pages/FavoriteAccountPage.jsx';
import { ReportPage } from '../../features/report/pages/ReportPage.jsx';
import { AdminClientsPage } from '../../features/clients/pages/AdminClientsPage.jsx';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Ruta pública: solo login */}
      <Route path='/' element={<AuthPage />} />

      {/* Reset password sigue siendo necesaria (llega por email) */}
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
        <Route index element={<ReportPage />} />
        <Route path='accounts' element={<AccountPage />} />
        <Route path='transactions' element={<TransactionPage />} />
        <Route path='products' element={<ProductPage />} />
        <Route path='favorites' element={<FavoriteAccountPage />} />
        <Route path='clients' element={<AdminClientsPage />} />
        <Route path='profile' element={<EditMyProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
};
