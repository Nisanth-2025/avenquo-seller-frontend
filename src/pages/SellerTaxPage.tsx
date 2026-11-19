import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSellerTax } from '../features/tax/hooks/useSellerTax';
import { TaxDetailsCard } from '../features/tax/components/TaxDetailsCard';
import { TaxDetailsForm } from '../features/tax/components/TaxDetailsForm';
import { AccountWorkspace } from '../features/account/components/AccountWorkspace';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { SellerTaxRequestDTO, SellerTaxUpdateRequestDTO } from '../types/tax.types';
import { Receipt, RefreshCw } from 'lucide-react';
import { SellerHeader } from '../components/navigation/SellerHeader';

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

  const verificationStatus = taxDetails?.verificationStatus || 'DRAFT';
  const isLocked =
    verificationStatus === 'SUBMITTED' ||
    verificationStatus === 'UNDER_REVIEW' ||
    verificationStatus === 'APPROVED' ||
    verificationStatus === 'REJECTED';

  const handleSaveTax = async (data: SellerTaxRequestDTO | SellerTaxUpdateRequestDTO) => {
    setApiError(null);
    setSuccessNotice(null);
    try {
      if (hasTaxDetails) {
        await updateMutation.mutateAsync(data as SellerTaxUpdateRequestDTO);
        setSuccessNotice('Tax details updated.');
      } else {
        await createMutation.mutateAsync(data as SellerTaxRequestDTO);
        setSuccessNotice('Tax details saved.');
      }
      await refetch();
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save tax records.';
      setApiError(msg);
      throw err;
    }
  };

  const handleSaveAndSubmit = async (data: SellerTaxRequestDTO | SellerTaxUpdateRequestDTO) => {
    setApiError(null);
    setSuccessNotice(null);
    try {
      if (hasTaxDetails) {
        await updateMutation.mutateAsync(data as SellerTaxUpdateRequestDTO);
      } else {
        await createMutation.mutateAsync(data as SellerTaxRequestDTO);
      }
      await submitMutation.mutateAsync();
      await refetch();
      setSuccessNotice('Tax details submitted for verification.');
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit tax records.';
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
      setSuccessNotice('Tax details submitted for verification.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit tax details.';
      setApiError(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f3f4f8]">
        <SellerHeader activeTab="account" />
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 animate-pulse">
            <Receipt className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-medium text-gray-600">Loading tax details…</p>
        </div>
      </div>
    );
  }

  if (isError && error && error.status !== 404) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f3f4f8]">
        <SellerHeader activeTab="account" />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md space-y-4 rounded-3xl bg-white p-8 text-center shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <RefreshCw className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Could not load tax details</h2>
            <p className="text-sm text-gray-500">
              {error.message || 'Unable to retrieve tax compliance records.'}
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
      </div>
    );
  }

  return (
    <AccountWorkspace
      title="Tax compliance"
      actions={
        hasTaxDetails && !isEditing && !isLocked ? (
          <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        ) : null
      }
    >
      {successNotice && (
        <Alert variant="success" message={successNotice} onClose={() => setSuccessNotice(null)} />
      )}
      {apiError && (
        <Alert variant="error" message={apiError} onClose={() => setApiError(null)} />
      )}

      {hasTaxDetails && (!isEditing || isLocked) && taxDetails ? (
        <TaxDetailsCard
          taxDetails={taxDetails}
          onEdit={() => setIsEditing(true)}
          onSubmit={handleSubmitVerification}
          isSubmitting={submitMutation.isPending}
        />
      ) : (
        <TaxDetailsForm
          initialData={taxDetails}
          onSaveDraft={handleSaveTax}
          onSubmitVerification={handleSaveAndSubmit}
          onCancel={hasTaxDetails ? () => setIsEditing(false) : undefined}
          isLoading={createMutation.isPending || updateMutation.isPending}
          isSubmitting={submitMutation.isPending}
        />
      )}
    </AccountWorkspace>
  );
};

export default SellerTaxPage;
