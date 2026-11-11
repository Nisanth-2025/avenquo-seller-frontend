import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSellerBank } from '../features/bank/hooks/useSellerBank';
import { BankDetailsCard } from '../features/bank/components/BankDetailsCard';
import { BankDetailsForm } from '../features/bank/components/BankDetailsForm';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import {
  ArrowLeft,
  RefreshCw,
  Landmark,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import type { SellerBankDetailsRequestDTO } from '../types/bank.types';

export const SellerBankPage: React.FC = () => {
  const {
    bankDetails,
    hasBankDetails,
    isLoading,
    isError,
    error,
    refetch,
    isDraft,
    isSubmitted,
    isUnderReview,
    isApproved,
    isRejected,
    canEdit,
    canSubmit,
    createMutation,
    updateMutation,
    submitMutation,
  } = useSellerBank();

  const [isEditing, setIsEditing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSaveBank = async (dto: SellerBankDetailsRequestDTO) => {
    setApiError(null);
    setSuccessNotice(null);
    try {
      if (hasBankDetails) {
        await updateMutation.mutateAsync(dto);
        setSuccessNotice('Bank payout details updated in draft.');
      } else {
        await createMutation.mutateAsync(dto);
        setSuccessNotice('Bank payout details registered successfully as draft.');
      }
      await refetch();
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save bank details.';
      setApiError(msg);
      throw err;
    }
  };

  const handleSaveAndSubmit = async (dto: SellerBankDetailsRequestDTO) => {
    setApiError(null);
    setSuccessNotice(null);
    try {
      if (hasBankDetails) {
        await updateMutation.mutateAsync(dto);
      } else {
        await createMutation.mutateAsync(dto);
      }
      await submitMutation.mutateAsync();
      await refetch();
      setSuccessNotice('Bank details submitted for compliance verification.');
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit bank details.';
      setApiError(msg);
      throw err;
    }
  };

  const handleSubmitVerification = async () => {
    setApiError(null);
    setSuccessNotice(null);
    try {
      await submitMutation.mutateAsync();
      await refetch();
      setSuccessNotice('Bank details submitted for compliance verification.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit bank details.';
      setApiError(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 mb-4 animate-pulse">
          <Landmark className="h-6 w-6 text-white" />
        </div>
        <p className="text-sm font-medium text-gray-600">Loading payout bank details…</p>
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
          <h2 className="text-lg font-bold text-gray-900">Unable to load bank details</h2>
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
            <span className="text-xs font-semibold text-gray-900">Bank & Payouts</span>
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
            <Link to="/dashboard/address" className="hover:text-gray-900 hidden sm:inline">
              Address
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
            <h1 className="text-2xl font-bold text-gray-900">Bank & Payout Details</h1>
            <p className="text-xs text-gray-500 mt-1">
              Configure settlement bank account to receive customer payments and marketplace disbursements.
            </p>
          </div>

          {/* Header Quick Actions */}
          {hasBankDetails && !isEditing && (
            <div className="flex items-center gap-2">
              {canEdit && (
                <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>
                  Edit Details
                </Button>
              )}
              {canSubmit && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSubmitVerification}
                  loading={submitMutation.isPending}
                >
                  Submit for Review
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Notices */}
        {successNotice && (
          <Alert variant="success" message={successNotice} onClose={() => setSuccessNotice(null)} />
        )}
        {apiError && (
          <Alert variant="error" message={apiError} onClose={() => setApiError(null)} />
        )}

        {/* Status Callout Banner */}
        {isApproved && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-xs flex items-start gap-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-emerald-950">
                Bank Payout Account Active & Verified
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                Your settlement destination is active. Net order revenue will be automatically disbursed to this bank account per payout schedule.
              </p>
            </div>
          </div>
        )}

        {(isSubmitted || isUnderReview) && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 shadow-xs flex items-start gap-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-brand-700 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Bank Verification In Progress
              </h4>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                Our banking compliance team is verifying your account holder credentials and IFSC code with the clearing network. Details are locked during review.
              </p>
            </div>
          </div>
        )}

        {isRejected && !isEditing && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-700 shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-red-950">
                  Payout Account Verification Rejected
                </h4>
                <p className="text-xs text-red-800 mt-0.5 leading-relaxed">
                  {bankDetails?.rejectionReason || 'Please review your bank credentials and submit updated records.'}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsEditing(true)}
              className="bg-red-600 hover:bg-red-700 text-white shrink-0"
            >
              Update Bank Details
            </Button>
          </div>
        )}

        {isDraft && !isEditing && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-950">
                  Bank Details Saved in Draft
                </h4>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Your bank information is saved but not yet submitted. Submit for verification to enable seller payout disbursements.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={handleSubmitVerification}
              loading={submitMutation.isPending}
              className="bg-brand-600 hover:bg-brand-700 text-white shrink-0"
            >
              Submit for Verification
            </Button>
          </div>
        )}

        {/* Content View or Form */}
        {!bankDetails || isEditing ? (
          <BankDetailsForm
            initialData={bankDetails}
            onSaveDraft={handleSaveBank}
            onSubmitVerification={handleSaveAndSubmit}
            onCancel={bankDetails ? () => setIsEditing(false) : undefined}
            isLoading={createMutation.isPending || updateMutation.isPending}
            isSubmitting={submitMutation.isPending}
          />
        ) : (
          <BankDetailsCard
            bankDetails={bankDetails}
            onEdit={() => setIsEditing(true)}
            onSubmit={handleSubmitVerification}
            isSubmitting={submitMutation.isPending}
          />
        )}

        {/* Informational Compliance Footer */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-card flex items-start gap-3.5 text-xs text-gray-500">
          <ShieldCheck className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-semibold text-gray-900">Banking Security & Settlement Guarantee</h5>
            <p className="leading-relaxed">
              All banking credentials are encrypted at rest using AES-GCM-256 authenticated encryption. Disbursements follow automated settlement cycles to your verified bank account via RBI NEFT / RTGS / IMPS clearing networks.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerBankPage;
