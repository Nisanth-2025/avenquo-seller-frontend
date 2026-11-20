import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSellerApplication } from '../features/seller/hooks/useSellerApplication';
import { ApplicationStepper } from '../features/seller/components/ApplicationStepper';
import { ApplicationStatusBanner } from '../features/seller/components/ApplicationStatusBanner';
import { ApplicationStatusBadge } from '../features/seller/components/ApplicationStatusBadge';
import { SellerApplicationForm } from '../features/seller/components/SellerApplicationForm';
import { StorefrontDetailsCard } from '../features/seller/components/StorefrontDetailsCard';
import { ApprovedStorefrontProfileView } from '../features/seller/components/ApprovedStorefrontProfileView';
import { AccountWorkspace } from '../features/account/components/AccountWorkspace';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { CreateSellerApplicationDTO, PatchSellerProfileDTO } from '../types/seller.types';
import { Edit3, RefreshCw, Store } from 'lucide-react';
import { SellerHeader } from '../components/navigation/SellerHeader';

export const SellerProfilePage: React.FC = () => {
  const {
    application,
    hasApplication,
    isLoading,
    isError,
    error,
    refetch,
    createMutation,
    updateMutation,
    submitMutation,
    patchProfileMutation,
    uploadLogoMutation,
    uploadBannerMutation,
    deleteLogoMutation,
    deleteBannerMutation,
    status,
    isEditable,
    isApproved,
  } = useSellerApplication();

  const [isEditing, setIsEditing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSaveDraft = async (data: CreateSellerApplicationDTO) => {
    setApiError(null);
    setSuccessNotice(null);
    try {
      if (!hasApplication) {
        await createMutation.mutateAsync(data);
        setSuccessNotice('Storefront application draft saved.');
      } else {
        await updateMutation.mutateAsync(data);
        setSuccessNotice('Storefront application updated.');
      }
      await refetch();
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save application.';
      setApiError(msg);
      throw err;
    }
  };

  const handleSubmitApplication = async (data: CreateSellerApplicationDTO) => {
    setApiError(null);
    setSuccessNotice(null);
    try {
      if (!hasApplication) {
        await createMutation.mutateAsync(data);
      } else {
        await updateMutation.mutateAsync(data);
      }
      await submitMutation.mutateAsync();
      await refetch();
      setSuccessNotice('Storefront application submitted for review.');
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit application.';
      setApiError(msg);
      throw err;
    }
  };

  const handlePatchProfile = async (data: PatchSellerProfileDTO) => {
    await patchProfileMutation.mutateAsync(data);
    const { data: refreshedApplication } = await refetch();

    const wasSaved = refreshedApplication &&
      Object.entries(data).every(([field, value]) =>
        refreshedApplication[field as keyof typeof refreshedApplication] === value
      );

    if (!wasSaved) {
      throw new Error('The server accepted the update, but the saved values could not be confirmed. Please try again.');
    }
  };

  const handleUploadLogo = async (file: File) => {
    await uploadLogoMutation.mutateAsync(file);
    await refetch();
  };

  const handleUploadBanner = async (file: File) => {
    await uploadBannerMutation.mutateAsync(file);
    await refetch();
  };

  const handleDeleteLogo = async () => {
    await deleteLogoMutation.mutateAsync();
    await refetch();
  };

  const handleDeleteBanner = async () => {
    await deleteBannerMutation.mutateAsync();
    await refetch();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f3f4f8]">
        <SellerHeader activeTab="account" />
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 animate-pulse">
            <Store className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-medium text-gray-600">Loading storefront…</p>
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
            <h2 className="text-lg font-semibold text-gray-900">Could not load storefront</h2>
            <p className="text-sm text-gray-500">
              {error.message || 'Unable to retrieve seller application details.'}
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
      title="Storefront"
      actions={
        <div className="flex items-center gap-2">
          {hasApplication && !isEditing && isEditable && !isApproved && (
            <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </Button>
          )}
          <ApplicationStatusBadge status={status || 'DRAFT'} size="sm" />
        </div>
      }
    >
      {successNotice && (
        <Alert variant="success" message={successNotice} onClose={() => setSuccessNotice(null)} />
      )}
      {apiError && (
        <Alert variant="error" message={apiError} onClose={() => setApiError(null)} />
      )}

      <ApplicationStepper
        status={status || 'DRAFT'}
        submittedAt={application?.submittedAt}
        approvedAt={application?.approvedAt}
      />

      <ApplicationStatusBanner
        status={status}
        rejectionReason={application?.rejectionReason}
      />

      {isApproved && application ? (
        <div className="space-y-6">
          <ApprovedStorefrontProfileView
            application={application}
            onPatchProfile={handlePatchProfile}
            onUploadLogo={handleUploadLogo}
            onUploadBanner={handleUploadBanner}
            onDeleteLogo={handleDeleteLogo}
            onDeleteBanner={handleDeleteBanner}
          />

          <div className="border-t border-gray-100 pt-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Registration details</h3>
            <StorefrontDetailsCard application={application} isEditable={false} />
          </div>
        </div>
      ) : hasApplication && !isEditing ? (
        <StorefrontDetailsCard
          application={application!}
          onEdit={() => setIsEditing(true)}
          isEditable={isEditable}
        />
      ) : (
        <SellerApplicationForm
          application={application || null}
          onSaveDraft={handleSaveDraft}
          onSubmitApplication={handleSubmitApplication}
          onCancel={hasApplication ? () => setIsEditing(false) : undefined}
          isEditable={isEditable}
          isSaving={createMutation.isPending || updateMutation.isPending}
          isSubmitting={submitMutation.isPending}
        />
      )}
    </AccountWorkspace>
  );
};

export default SellerProfilePage;
