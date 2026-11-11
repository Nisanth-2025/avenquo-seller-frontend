import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

/** Shows a full-screen spinner during the token-refresh boot check */
const Spinner: React.FC = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-white gap-4">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600">
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    </div>
    <p className="text-sm font-medium text-gray-500">Signing you in…</p>
  </div>
);

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
};

export const PublicRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};
