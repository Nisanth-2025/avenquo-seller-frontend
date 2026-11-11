import React from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { Button } from '../components/ui/Button';
import { LogOut, Package, ShoppingBag, BarChart3, Settings } from 'lucide-react';

const SellerDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900">Avenquo</span>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 ring-1 ring-brand-200">
              Seller Hub
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-600">{user?.email}</span>
            <Button variant="secondary" size="sm" onClick={logout}>
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Your seller dashboard is ready. Start listing products to reach customers.
          </p>
        </div>

        {/* Empty-state cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { Icon: Package, label: 'Products', desc: 'List and manage your catalog', href: '#' },
            { Icon: ShoppingBag, label: 'Orders', desc: 'View and fulfil customer orders', href: '#' },
            { Icon: BarChart3, label: 'Analytics', desc: 'Sales and revenue reports', href: '#' },
            { Icon: Settings, label: 'Settings', desc: 'Store profile and preferences', href: '#' },
          ].map(({ Icon, label, desc }) => (
            <div
              key={label}
              className="group flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-card hover:border-brand-300 hover:shadow-md transition-all duration-150 cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-brand-50 transition-colors">
                <Icon className="h-5 w-5 text-gray-500 group-hover:text-brand-600 transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
                <p className="mt-0.5 text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Placeholder prompt */}
        <div className="mt-10 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <Package className="mx-auto h-10 w-10 text-gray-300" />
          <h3 className="mt-3 text-sm font-semibold text-gray-700">No products yet</h3>
          <p className="mt-1 text-xs text-gray-400">
            Add your first product to start selling on Avenquo.
          </p>
          <Button className="mt-5 mx-auto" size="sm">
            Add first product
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SellerDashboardPage;
