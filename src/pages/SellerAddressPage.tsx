import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSellerAddress } from '../features/address/hooks/useSellerAddress';
import { SellerAddressCard } from '../features/address/components/SellerAddressCard';
import { SellerAddressForm } from '../features/address/components/SellerAddressForm';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import {
  ArrowLeft,
  RefreshCw,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import type { SellerAddressRequestDTO } from '../types/address.types';

export const SellerAddressPage: React.FC = () => {
  const {
    address,
    isLoading,
    isError,
    error,
    refetch,
    createMutation,
    updateMutation,
  } = useSellerAddress();

  const [isEditing, setIsEditing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSaveAddress = async (
    dto: SellerAddressRequestDTO,
    countryId: number,
    stateId: number,
    districtId: number
  ) => {
    setApiError(null);
    setSuccessNotice(null);
    try {
      if (address) {
        await updateMutation.mutateAsync({
          dto,
          countryId,
          stateId,
          districtId,
        });
        setSuccessNotice('Business address updated successfully.');
      } else {
        await createMutation.mutateAsync({
          dto,
          countryId,
          stateId,
          districtId,
        });
        setSuccessNotice('Principal business address registered successfully.');
      }
      await refetch();
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save address.';
      setApiError(msg);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 mb-4 animate-pulse">
          <MapPin className="h-6 w-6 text-white" />
        </div>
        <p className="text-sm font-medium text-gray-600">Loading business address details…</p>
      </div>
    );
  }

  if (isError && error && error.status !== 404) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-card space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 mx-auto">
            <RefreshCw className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Unable to load business address</h2>
          <p className="text-xs text-gray-500">{error.message || 'Server error occurred.'}</p>
          <Button onClick={() => refetch()} variant="primary" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Top sticky nav */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-semibold text-gray-900">Business Address</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <Link to="/dashboard/tax" className="hover:text-gray-900 hidden sm:inline">
              Tax Compliance
            </Link>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <Link to="/dashboard/documents" className="hover:text-gray-900 hidden sm:inline">
              Documents
            </Link>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <Link to="/dashboard/bank" className="hover:text-gray-900 hidden sm:inline">
              Bank Details
            </Link>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <Link to="/dashboard/profile" className="hover:text-gray-900 hidden sm:inline">
              Store Profile
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Principal Business Address</h1>
            <p className="text-xs text-gray-500 mt-1">
              Registered operational location for tax invoicing, delivery manifests, and merchant compliance.
            </p>
          </div>

          {address && !isEditing && (
            <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>
              Edit Address
            </Button>
          )}
        </div>

        {/* Notices */}
        {successNotice && (
          <Alert variant="success" message={successNotice} onClose={() => setSuccessNotice(null)} />
        )}
        {apiError && (
          <Alert variant="error" message={apiError} onClose={() => setApiError(null)} />
        )}

        {/* Address Content */}
        {!address || isEditing ? (
          <SellerAddressForm
            initialData={address}
            onSave={handleSaveAddress}
            onCancel={address ? () => setIsEditing(false) : undefined}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        ) : (
          <SellerAddressCard address={address} onEdit={() => setIsEditing(true)} />
        )}

        {/* Informational Compliance Footer */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-card flex items-start gap-3.5 text-xs text-gray-500">
          <ShieldCheck className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-semibold text-gray-900">Statutory Merchant Requirement</h5>
            <p className="leading-relaxed">
              Every merchant on Avenquo is required under Indian Consumer Protection (E-Commerce) Rules and GST statutory provisions to maintain a verified principal place of business. This address is used on tax invoices issued to customers and shipping pickup manifests.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerAddressPage;
