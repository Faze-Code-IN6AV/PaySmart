import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx';
import { VerifyEmailPage } from '../../features/auth/pages/VerifyEmailPage.jsx';
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { DashboardLayout } from '../layouts/DashboardLayout.jsx';
import { AccountPage } from '../../features/account/pages/AccountPage.jsx';
import { TransactionPage } from '../../features/transaction/pages/TransactionPage.jsx';
import { ProductPage } from '../../features/product/pages/ProductPage.jsx';
import { FavoriteAccountPage } from '../../features/favoriteaccount/pages/FavoriteAccountPage.jsx';
import { ReportPage } from '../../features/report/pages/ReportPage.jsx';

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
        {/* /dashboard — Panel de administración (reportes para admin, bienvenida para usuario) */}
        <Route index element={<ReportPage />} />

        {/* /dashboard/accounts */}
        <Route path='accounts' element={<AccountPage />} />

        {/* /dashboard/transactions */}
        <Route path='transactions' element={<TransactionPage />} />

        {/* /dashboard/products */}
        <Route path='products' element={<ProductPage />} />

          {/* /dashboard/favorites */}
        <Route path='favorites' element={<FavoriteAccountPage />} />
      </Route>

      {/* Fallback */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
};