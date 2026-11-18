import React, { useState } from 'react';
import { useSellerBank } from '../features/bank/hooks/useSellerBank';
import { BankDetailsCard } from '../features/bank/components/BankDetailsCard';
import { BankDetailsForm } from '../features/bank/components/BankDetailsForm';
import { AccountWorkspace } from '../features/account/components/AccountWorkspace';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { AlertCircle, Landmark, RefreshCw } from 'lucide-react';
import { SellerHeader } from '../components/navigation/SellerHeader';
import type { SellerBankDetailsRequestDTO } from '../types/bank.types';

export const SellerBankPage: React.FC = () => {
  const {
    bankDetails,
    hasBankDetails,
    isLoading,
    isError,
    error,
    refetch,
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
        setSuccessNotice('Payout details updated.');
      } else {
        await createMutation.mutateAsync(dto);
        setSuccessNotice('Payout details saved.');
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
      setSuccessNotice('Payout details submitted for verification.');
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
      setSuccessNotice('Payout details submitted for verification.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit bank details.';
      setApiError(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f3f4f8]">
        <SellerHeader activeTab="account" />
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 animate-pulse">
            <Landmark className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-medium text-gray-600">Loading payout details…</p>
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
            <h2 className="text-lg font-semibold text-gray-900">Could not load payout details</h2>
            <p className="text-sm text-gray-500">{error.message || 'Unable to retrieve bank details.'}</p>
            <Button onClick={() => refetch()} variant="primary" size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AccountWorkspace
      title="Payouts"
      actions={
        hasBankDetails && !isEditing ? (
          <>
            {canEdit && (
              <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
            {canSubmit && (
              <Button
                size="sm"
                variant="primary"
                onClick={handleSubmitVerification}
                loading={submitMutation.isPending}
              >
                Submit
              </Button>
            )}
          </>
        ) : null
      }
    >
      {successNotice && (
        <Alert variant="success" message={successNotice} onClose={() => setSuccessNotice(null)} />
      )}
      {apiError && (
        <Alert variant="error" message={apiError} onClose={() => setApiError(null)} />
      )}

      {isRejected && !isEditing && bankDetails?.rejectionReason && (
        <div className="flex items-start gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p>{bankDetails.rejectionReason}</p>
        </div>
      )}

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
    </AccountWorkspace>
  );
};

export default SellerBankPage;
