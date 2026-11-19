import React, { useState } from 'react';
import { useSellerAddress } from '../features/address/hooks/useSellerAddress';
import { SellerAddressCard } from '../features/address/components/SellerAddressCard';
import { SellerAddressForm } from '../features/address/components/SellerAddressForm';
import { AccountWorkspace } from '../features/account/components/AccountWorkspace';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { MapPin, RefreshCw } from 'lucide-react';
import { SellerHeader } from '../components/navigation/SellerHeader';
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
        setSuccessNotice('Address updated.');
      } else {
        await createMutation.mutateAsync({
          dto,
          countryId,
          stateId,
          districtId,
        });
        setSuccessNotice('Address saved.');
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
      <div className="flex min-h-screen flex-col bg-[#f3f4f8]">
        <SellerHeader activeTab="account" />
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 animate-pulse">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-medium text-gray-600">Loading address…</p>
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
            <h2 className="text-lg font-semibold text-gray-900">Could not load address</h2>
            <p className="text-sm text-gray-500">{error.message || 'Unable to retrieve the business address.'}</p>
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
      title="Address"
      actions={
        address && !isEditing ? (
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
    </AccountWorkspace>
  );
};

export default SellerAddressPage;
