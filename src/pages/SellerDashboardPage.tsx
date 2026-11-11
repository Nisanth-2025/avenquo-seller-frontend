import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useSellerApplication } from '../features/seller/hooks/useSellerApplication';
import { Button } from '../components/ui/Button';
import { ApplicationStatusBadge } from '../features/seller/components/ApplicationStatusBadge';
import {
  LogOut,
  Package,
  ShoppingBag,
  Store,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  Receipt,
} from 'lucide-react';

export const SellerDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { application, status, isApproved, isChangesRequired, isSubmittedOrReview, isDraft, hasApplication } =
    useSellerApplication();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">Avenquo</span>
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 ring-1 ring-brand-200">
                Seller Hub
              </span>
            </div>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-4 text-xs font-medium">
              <Link to="/dashboard" className="text-brand-600">
                Overview
              </Link>
              <Link
                to="/dashboard/profile"
                className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5"
              >
                <span>Store Profile</span>
                {status && <ApplicationStatusBadge status={status} size="sm" />}
              </Link>
              <Link
                to="/dashboard/tax"
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                Tax Compliance
              </Link>
            </nav>
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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''} 👋
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your merchant storefront, product inventory, and customer orders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/dashboard/tax">
              <Button size="sm" variant="secondary">
                <Receipt className="h-4 w-4" /> Tax Details
              </Button>
            </Link>
            <Link to="/dashboard/profile">
              <Button size="sm" variant="secondary">
                <Store className="h-4 w-4" /> Store Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Onboarding Banner based on Application Status ── */}
        {!hasApplication && (
          <div className="rounded-2xl border border-brand-200 bg-gradient-to-r from-blue-50 via-indigo-50/40 to-white p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand-700 bg-brand-100/70 px-2.5 py-0.5 rounded-full">
                  <Sparkles className="h-3 w-3" /> Step 1: Merchant Setup
                </span>
                <h3 className="text-lg font-bold text-gray-900">
                  Register Your Storefront Application
                </h3>
                <p className="text-xs text-gray-600 max-w-xl">
                  Set up your brand name, URL slug, entity registration, and support details to begin selling on Avenquo.
                </p>
              </div>
              <Link to="/dashboard/profile">
                <Button size="md" className="shadow-md">
                  Start Application <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {isDraft && (
          <div className="rounded-2xl border border-gray-300 bg-white p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                  Draft Saved
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  {application?.storeName} ({application?.storeSlug})
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Finish & Submit Your Seller Application
              </h3>
              <p className="text-xs text-gray-500">
                Your draft is saved. Review your storefront fields and submit for compliance review.
              </p>
            </div>
            <Link to="/dashboard/profile">
              <Button size="sm">
                Resume Application <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {isChangesRequired && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" /> Action Required
                </span>
              </div>
              <h3 className="text-base font-bold text-amber-950">
                Reviewer Requested Changes
              </h3>
              <p className="text-xs text-amber-800 line-clamp-2">
                {application?.rejectionReason || 'Please review your application fields and update per reviewer guidelines.'}
              </p>
            </div>
            <Link to="/dashboard/profile">
              <Button size="sm" variant="primary" className="bg-amber-600 hover:bg-amber-700 text-white">
                Edit & Resubmit <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {isSubmittedOrReview && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-brand-800 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Under Compliance Review
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Application Submitted for Verification
              </h3>
              <p className="text-xs text-gray-500">
                Our team is reviewing your entity records. We will notify you once your storefront is approved.
              </p>
            </div>
            <Link to="/dashboard/profile">
              <Button size="sm" variant="secondary">
                View Application Status
              </Button>
            </Link>
          </div>
        )}

        {/* ── Feature Cards ── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Store Profile Card */}
          <Link
            to="/dashboard/profile"
            className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-card hover:border-brand-300 hover:shadow-md transition-all duration-150"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-brand-50 transition-colors">
                  <Store className="h-5 w-5 text-gray-500 group-hover:text-brand-600 transition-colors" />
                </div>
                {status && <ApplicationStatusBadge status={status} size="sm" />}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                  Storefront Profile
                </h3>
                <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
                  {isApproved
                    ? 'Manage public logo, banner, and customer support channels'
                    : 'Manage seller registration application and status'}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs font-semibold text-brand-600 group-hover:translate-x-1 transition-transform">
              <span>{isApproved ? 'Manage Profile' : 'View Application'}</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </div>
          </Link>

          {/* Tax Compliance Card */}
          <Link
            to="/dashboard/tax"
            className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-card hover:border-brand-300 hover:shadow-md transition-all duration-150"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-brand-50 transition-colors">
                  <Receipt className="h-5 w-5 text-gray-500 group-hover:text-brand-600 transition-colors" />
                </div>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Encrypted
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                  Tax & GST Compliance
                </h3>
                <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
                  Manage PAN, GST identification, and corporate CIN records
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs font-semibold text-brand-600 group-hover:translate-x-1 transition-transform">
              <span>Manage Tax Records</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </div>
          </Link>

          {/* Products */}
          <div className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-card hover:border-gray-300 transition-all duration-150 opacity-85">
            <div className="flex flex-col gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <Package className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Product Catalog</h3>
                <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
                  List, price, and synchronize SKUs across marketplaces
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
              {isApproved ? 'Available' : 'Requires approved profile'}
            </div>
          </div>

          {/* Orders */}
          <div className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-card hover:border-gray-300 transition-all duration-150 opacity-85">
            <div className="flex flex-col gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <ShoppingBag className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Orders & Fulfillment</h3>
                <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
                  Track shipping manifests and fulfillment dispatch
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
              {isApproved ? '0 active orders' : 'Requires approved profile'}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerDashboardPage;
