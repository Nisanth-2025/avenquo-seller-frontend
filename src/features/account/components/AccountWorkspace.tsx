import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileCheck, Landmark, MapPin, Receipt, Store } from 'lucide-react';
import { SellerHeader } from '../../../components/navigation/SellerHeader';

const NAV = [
  { to: '/dashboard/profile', label: 'Storefront', icon: Store },
  { to: '/dashboard/tax', label: 'Tax', icon: Receipt },
  { to: '/dashboard/documents', label: 'Documents', icon: FileCheck },
  { to: '/dashboard/bank', label: 'Payouts', icon: Landmark },
  { to: '/dashboard/address', label: 'Address', icon: MapPin },
];

interface AccountWorkspaceProps {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const AccountWorkspace: React.FC<AccountWorkspaceProps> = ({ title, actions, children }) => {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-[#f3f4f8]">
      <SellerHeader activeTab="account" />

      <div className="mx-auto w-full max-w-[1180px] flex-1 px-3 py-4 sm:px-6 sm:py-6">
        <div className="flex min-h-[calc(100vh-7.25rem)] overflow-hidden rounded-[28px] bg-white shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <aside className="hidden w-[220px] shrink-0 border-r border-gray-100 px-3 py-5 md:block">
            <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
              Account
            </p>
            <nav className="space-y-1">
              {NAV.map((item) => {
                const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'text-brand-600' : 'text-gray-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="flex gap-2 overflow-x-auto border-b border-gray-100 px-3 py-3 md:hidden">
              {NAV.map((item) => {
                const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${
                      active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <h1 className="text-[22px] font-semibold tracking-tight text-gray-900">{title}</h1>
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>

            <div className="space-y-5 px-5 py-6 sm:px-7">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
