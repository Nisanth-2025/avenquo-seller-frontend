import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/RouteGuards';
import SellerAuthPage from './pages/SellerAuthPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import SellerProductsPage from './pages/SellerProductsPage';
import SellerCategoriesPage from './pages/SellerCategoriesPage';
import SellerProfilePage from './pages/SellerProfilePage';
import SellerTaxPage from './pages/SellerTaxPage';
import SellerDocumentsPage from './pages/SellerDocumentsPage';
import SellerBankPage from './pages/SellerBankPage';
import SellerAddressPage from './pages/SellerAddressPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public: redirect to dashboard if already signed in */}
          <Route element={<PublicRoute />}>
            <Route path="/auth" element={<SellerAuthPage />} />
          </Route>

          {/* Protected: redirect to auth if not signed in */}
          <Route element={<ProtectedRoute />}>
            {/* Core Operations Dashboard */}
            <Route path="/dashboard" element={<SellerDashboardPage />} />
            <Route path="/dashboard/products" element={<SellerProductsPage />} />
            <Route path="/dashboard/categories" element={<SellerCategoriesPage />} />

            {/* Seller Account Modules (accessed via top-right profile menu) */}
            <Route path="/dashboard/profile" element={<SellerProfilePage />} />
            <Route path="/dashboard/tax" element={<SellerTaxPage />} />
            <Route path="/dashboard/documents" element={<SellerDocumentsPage />} />
            <Route path="/dashboard/bank" element={<SellerBankPage />} />
            <Route path="/dashboard/address" element={<SellerAddressPage />} />

            {/* Convenience Aliases & Redirects */}
            <Route path="/products" element={<Navigate to="/dashboard/products" replace />} />
            <Route path="/categories" element={<Navigate to="/dashboard/categories" replace />} />
            <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />
            <Route path="/tax" element={<Navigate to="/dashboard/tax" replace />} />
            <Route path="/documents" element={<Navigate to="/dashboard/documents" replace />} />
            <Route path="/bank" element={<Navigate to="/dashboard/bank" replace />} />
            <Route path="/address" element={<Navigate to="/dashboard/address" replace />} />
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
