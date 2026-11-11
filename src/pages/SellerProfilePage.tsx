import React from 'react';
import { Link } from 'react-router-dom';
import { useSellerApplication } from '../features/seller/hooks/useSellerApplication';
import { ApplicationStepper } from '../features/seller/components/ApplicationStepper';
import { ApplicationStatusBanner } from '../features/seller/components/ApplicationStatusBanner';
import { ApplicationStatusBadge } from '../features/seller/components/ApplicationStatusBadge';
import { SellerApplicationForm } from '../features/seller/components/SellerApplicationForm';
import { ApprovedStorefrontProfileView } from '../features/seller/components/ApprovedStorefrontProfileView';
import { Button } from '../components/ui/Button';
import { CreateSellerApplicationDTO, PatchSellerProfileDTO } from '../types/seller.types';
import { ArrowLeft, RefreshCw, Store, ShieldCheck } from 'lucide-react';
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
    // Save latest form changes first, then call submit
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 mb-4 animate-pulse">
          <Store className="h-6 w-6 text-white" />
        </div>
        <p className="text-sm font-medium text-gray-600">Loading seller profile & application…</p>
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
          <h2 className="text-lg font-semibold text-gray-900">Failed to Load Seller Profile</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            {error.message || 'Unable to retrieve seller application details from server.'}
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SellerHeader activeTab="account" />

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
            <span className="text-sm font-semibold text-gray-900">Store Profile</span>
          </div>

          <div className="flex items-center gap-2">
            <ApplicationStatusBadge status={status || 'DRAFT'} size="sm" />
          </div>
        </div>
      </div>

      {/* ── Main Container ── */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
        {/* Page Title & Intro */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                {isApproved ? 'Storefront Profile & Settings' : 'Seller Application & Storefront Setup'}
              </h1>
              {isApproved && (
                <span title="Verified Merchant">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {isApproved
                ? 'Manage your public merchant presence, logo, cover banner, and buyer support channels.'
                : 'Complete your business profile and contact information to register your merchant storefront.'}
            </p>
          </div>

          {hasApplication && (
            <div className="text-xs text-gray-400 sm:text-right font-mono">
              <div>ID: <span className="text-gray-600">{application?.id}</span></div>
              {application?.updatedAt && (
                <div>Updated: {new Date(application.updatedAt).toLocaleDateString()}</div>
              )}
            </div>
          )}
        </div>

        {/* Application Progress Stepper */}
        <ApplicationStepper
          status={status || 'DRAFT'}
          submittedAt={application?.submittedAt}
          approvedAt={application?.approvedAt}
        />

        {/* Contextual Status Banner */}
        <ApplicationStatusBanner
          status={status}
          rejectionReason={application?.rejectionReason}
        />

        {/* ── Main View Switching ── */}
        {isApproved && application ? (
          <div className="space-y-8">
            {/* Approved Storefront View with Logo/Banner and Profile Patch */}
            <ApprovedStorefrontProfileView
              application={application}
              onPatchProfile={handlePatchProfile}
              onUploadLogo={handleUploadLogo}
              onUploadBanner={handleUploadBanner}
              onDeleteLogo={handleDeleteLogo}
              onDeleteBanner={handleDeleteBanner}
            />

            {/* Read-Only Compliance Application Records */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Approved Registration Details (Read-Only)
                </h3>
                <p className="text-xs text-gray-500">
                  Business entity and authorized representative records submitted during onboarding.
                </p>
              </div>

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
          /* Application Form for Onboarding / Draft / Changes Required / Review */
          <SellerApplicationForm
            application={application || null}
            onSaveDraft={handleSaveDraft}
            onSubmitApplication={handleSubmitApplication}
            isEditable={isEditable}
            isSaving={createMutation.isPending || updateMutation.isPending}
            isSubmitting={submitMutation.isPending}
          />
        )}
      </main>
    </div>
  );
};

export default SellerProfilePage;
