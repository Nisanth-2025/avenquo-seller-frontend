import React from 'react';
import { Link } from 'react-router-dom';
import { useSellerApplication } from '../features/seller/hooks/useSellerApplication';
import { ApplicationStepper } from '../features/seller/components/ApplicationStepper';
import { ApplicationStatusBanner } from '../features/seller/components/ApplicationStatusBanner';
import { ApplicationStatusBadge } from '../features/seller/components/ApplicationStatusBadge';
import { SellerApplicationForm } from '../features/seller/components/SellerApplicationForm';
import { ApprovedStorefrontProfileView } from '../features/seller/components/ApprovedStorefrontProfileView';
import { AccountWorkspace } from '../features/account/components/AccountWorkspace';
import { Button } from '../components/ui/Button';
import { CreateSellerApplicationDTO, PatchSellerProfileDTO } from '../types/seller.types';
import { RefreshCw, Store } from 'lucide-react';
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

  const handleSaveDraft = async (data: CreateSellerApplicationDTO) => {
    if (!hasApplication) {
      await createMutation.mutateAsync(data);
    } else {
      await updateMutation.mutateAsync(data);
    }
  };

  const handleSubmitApplication = async (data: CreateSellerApplicationDTO) => {
    if (!hasApplication) {
      await createMutation.mutateAsync(data);
    } else {
      await updateMutation.mutateAsync(data);
    }
    await submitMutation.mutateAsync();
  };

  const handlePatchProfile = async (data: PatchSellerProfileDTO) => {
    await patchProfileMutation.mutateAsync(data);
  };

  const handleUploadLogo = async (file: File) => {
    await uploadLogoMutation.mutateAsync(file);
  };

  const handleUploadBanner = async (file: File) => {
    await uploadBannerMutation.mutateAsync(file);
  };

  const handleDeleteLogo = async () => {
    await deleteLogoMutation.mutateAsync();
  };

  const handleDeleteBanner = async () => {
    await deleteBannerMutation.mutateAsync();
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
      actions={<ApplicationStatusBadge status={status || 'DRAFT'} size="sm" />}
    >
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
            <SellerApplicationForm
              application={application}
              onSaveDraft={handleSaveDraft}
              onSubmitApplication={handleSubmitApplication}
              isEditable={false}
              isSaving={false}
              isSubmitting={false}
            />
          </div>
        </div>
      ) : (
        <SellerApplicationForm
          application={application || null}
          onSaveDraft={handleSaveDraft}
          onSubmitApplication={handleSubmitApplication}
          isEditable={isEditable}
          isSaving={createMutation.isPending || updateMutation.isPending}
          isSubmitting={submitMutation.isPending}
        />
      )}
    </AccountWorkspace>
  );
};

export default SellerProfilePage;
