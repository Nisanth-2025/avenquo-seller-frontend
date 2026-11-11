import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSellerTax } from '../features/tax/hooks/useSellerTax';
import { TaxDetailsCard } from '../features/tax/components/TaxDetailsCard';
import { TaxDetailsForm } from '../features/tax/components/TaxDetailsForm';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { SellerTaxRequestDTO } from '../types/tax.types';
import { ArrowLeft, RefreshCw, Receipt, ShieldCheck } from 'lucide-react';

export const SellerTaxPage: React.FC = () => {
  const {
    taxDetails,
    hasTaxDetails,
    isLoading,
    isError,
    error,
    refetch,
    createMutation,
    updateMutation,
    submitMutation,
  } = useSellerTax();

  const [isEditing, setIsEditing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSaveTax = async (data: SellerTaxRequestDTO) => {
    setApiError(null);
    setSuccessNotice(null);
    try {
      if (hasTaxDetails) {
        await updateMutation.mutateAsync(data);
        setSuccessNotice('Tax details updated successfully.');
      } else {
        await createMutation.mutateAsync(data);
        setSuccessNotice('Tax details registered successfully.');
      }
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save tax records.';
      setApiError(msg);
    }
  };

  const handleSubmitVerification = async () => {
    setApiError(null);
    setSuccessNotice(null);
    try {
      await submitMutation.mutateAsync();
      setSuccessNotice('Tax details submitted for compliance verification.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit tax details.';
      setApiError(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 mb-4 animate-pulse">
          <Receipt className="h-6 w-6 text-white" />
        </div>
        <p className="text-sm font-medium text-gray-600">Loading tax compliance details…</p>
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
          <h2 className="text-lg font-semibold text-gray-900">Unable to Load Tax Details</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            {error.message || 'Server error while fetching tax compliance records.'}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link to="/dashboard">
              <Button variant="secondary" size="sm">
                Back to Dashboard
              </Button>
            </Link>
            <Button size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Sub-header Navigation ── */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-gray-900">Tax Compliance</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="hidden sm:inline">Statutory Identification</span>
          </div>
        </div>
      </div>

      {/* ── Main Container ── */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Tax & Statutory Compliance
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Indian taxation credentials required for invoice settlement and merchant ledger payouts.
            </p>
          </div>

          {hasTaxDetails && !isEditing && (
            <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>
              Edit Details
            </Button>
          )}
        </div>

        {/* Feedback alerts */}
        {successNotice && (
          <Alert variant="success" message={successNotice} onClose={() => setSuccessNotice(null)} />
        )}
        {apiError && (
          <Alert variant="error" message={apiError} onClose={() => setApiError(null)} />
        )}

        {/* ── Dynamic Content: Card or Form ── */}
        {hasTaxDetails && !isEditing && taxDetails ? (
          <TaxDetailsCard
            taxDetails={taxDetails}
            onEdit={() => setIsEditing(true)}
            onSubmit={handleSubmitVerification}
            isSubmitting={submitMutation.isPending}
          />
        ) : (
          <TaxDetailsForm
            initialData={taxDetails}
            onSubmit={handleSaveTax}
            onCancel={hasTaxDetails ? () => setIsEditing(false) : undefined}
            isLoading={createMutation.isPending || updateMutation.isPending}
            isEditMode={isEditing}
          />
        )}
      </main>
    </div>
  );
};

export default SellerTaxPage;
