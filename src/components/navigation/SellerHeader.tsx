import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useSellerApplication } from '../../features/seller/hooks/useSellerApplication';
import { ApplicationStatusBadge } from '../../features/seller/components/ApplicationStatusBadge';
import {
  LogOut,
  Store,
  Receipt,
  FileCheck,
  Landmark,
  MapPin,
  ChevronDown,
  User,
  Menu,
  X,
  Package,
  Layers,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';

interface SellerHeaderProps {
  activeTab?: 'dashboard' | 'products' | 'categories' | 'account';
}

export const SellerHeader: React.FC<SellerHeaderProps> = ({ activeTab }) => {
  const { user, logout } = useAuth();
  const { application, status } = useSellerApplication();
  const location = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const currentTab =
    activeTab ||
    (location.pathname.startsWith('/dashboard/products')
      ? 'products'
      : location.pathname.startsWith('/dashboard/categories')
      ? 'categories'
      : location.pathname === '/dashboard'
      ? 'dashboard'
      : 'account');

  const sellerAccountModules = [
    {
      to: '/dashboard/profile',
      label: 'Storefront Profile',
      desc: 'Brand identity, logo & storefront details',
      icon: Store,
      badge: status ? <ApplicationStatusBadge status={status} size="sm" /> : null,
    },
    {
      to: '/dashboard/tax',
      label: 'Tax & GST Compliance',
      desc: 'PAN, GSTIN identification & CIN',
      icon: Receipt,
    },
    {
      to: '/dashboard/documents',
      label: 'Statutory Documents',
      desc: 'KYC certificates & legal proof uploads',
      icon: FileCheck,
    },
    {
      to: '/dashboard/bank',
      label: 'Bank & Payout Details',
      desc: 'Direct settlement bank account & IFSC',
      icon: Landmark,
    },
    {
      to: '/dashboard/address',
      label: 'Business Address',
      desc: 'Operating premises & dispatch hub',
      icon: MapPin,
    },
  ];

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-30 shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand + Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-sm group-hover:bg-brand-700 transition-colors">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-gray-900 group-hover:text-brand-600 transition-colors">
                Avenquo
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-600">
                Seller Hub
              </span>
            </div>
          </Link>

          {/* Primary Operations Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Overview</span>
            </Link>

            <Link
              to="/dashboard/products"
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'products'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Package className="h-4 w-4" />
              <span>Products</span>
            </Link>

            <Link
              to="/dashboard/categories"
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'categories'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Categories</span>
            </Link>
          </nav>
        </div>

        {/* Right: Seller Account Profile Dropdown & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {/* Seller Account Menu (Dropdown) */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-expanded={isDropdownOpen}
              className={`flex items-center gap-2.5 rounded-xl border p-1.5 pr-2.5 text-left transition-all ${
                isDropdownOpen
                  ? 'border-brand-500 ring-2 ring-brand-100 bg-brand-50/50'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 shadow-sm'
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-xs shadow-xs">
                {application?.logoUrl ? (
                  <img
                    src={application.logoUrl}
                    alt={application.storeName || 'Store'}
                    className="h-8 w-8 rounded-lg object-cover"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-gray-900 max-w-[120px] truncate leading-tight">
                  {application?.storeName || user?.email?.split('@')[0] || 'Seller Account'}
                </span>
                <span className="text-[10px] text-gray-500 flex items-center gap-1 leading-none mt-0.5">
                  <span>Seller Account</span>
                  {status === 'APPROVED' && <ShieldCheck className="h-3 w-3 text-emerald-600" />}
                </span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180 text-brand-600' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-slide-up z-50">
                {/* User / Merchant Summary */}
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-brand-50/30 p-3 mb-2 border border-gray-100">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {application?.storeName || 'Merchant Storefront'}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                    </div>
                    {status && <ApplicationStatusBadge status={status} size="sm" />}
                  </div>
                  {application?.storeSlug && (
                    <div className="mt-1.5 pt-1.5 border-t border-gray-200/50 flex items-center justify-between text-[11px] text-gray-500">
                      <span>Slug:</span>
                      <span className="font-mono text-gray-700 font-medium">
                        {application.storeSlug}
                      </span>
                    </div>
                  )}
                </div>

                {/* Seller Account Section Header */}
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                  <span>Seller Account Modules</span>
                </div>

                {/* The 5 Modules */}
                <div className="space-y-0.5">
                  {sellerAccountModules.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.to;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsDropdownOpen(false)}
                        className={`flex items-start gap-3 rounded-xl p-2.5 transition-colors ${
                          isActive
                            ? 'bg-brand-50 text-brand-900'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg mt-0.5 ${
                            isActive
                              ? 'bg-brand-600 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`text-xs font-semibold ${
                                isActive ? 'text-brand-900' : 'text-gray-900'
                              }`}
                            >
                              {item.label}
                            </span>
                            {item.badge}
                          </div>
                          <p className="text-[11px] text-gray-500 truncate leading-snug">
                            {item.desc}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Divider & Sign out */}
                <div className="my-1.5 border-t border-gray-100" />
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu hamburger toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-4 shadow-lg animate-slide-up">
          {/* Quick Nav */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 py-1">
              Operations
            </div>
            <Link
              to="/dashboard"
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold ${
                currentTab === 'dashboard'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Overview</span>
            </Link>
            <Link
              to="/dashboard/products"
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold ${
                currentTab === 'products'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Package className="h-4 w-4" />
              <span>Products</span>
            </Link>
            <Link
              to="/dashboard/categories"
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold ${
                currentTab === 'categories'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Categories</span>
            </Link>
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 py-1">
              Seller Account
            </div>
            {sellerAccountModules.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-gray-500" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-gray-100 pt-2">
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out ({user?.email})</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
