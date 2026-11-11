import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/RouteGuards';
import SellerAuthPage from './pages/SellerAuthPage';
import SellerDashboardPage from './pages/SellerDashboardPage';

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
            <Route path="/dashboard" element={<SellerDashboardPage />} />
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
