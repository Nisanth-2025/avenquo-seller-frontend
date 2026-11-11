import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Alert } from '../../../components/ui/Alert';
import { ImageUploadDropzone } from './ImageUploadDropzone';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import type { PatchSellerProfileDTO, SellerProfileResponseDTO } from '../../../types/seller.types';
import { ApiClientError } from '../../../api/client';
import {
  Store,
  Globe,
  Mail,
  Phone,
  Edit3,
  ExternalLink,
  ShieldCheck,
  Check,
  Building,
} from 'lucide-react';

const phoneRegex = /^\+91[6-9]\d{9}$/;

const patchSchema = z.object({
  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional()
    .or(z.literal('')),
  supportEmail: z
    .string()
    .email('Enter a valid email address')
    .max(320, 'Email must not exceed 320 characters')
    .optional()
    .or(z.literal('')),
  supportPhone: z
    .string()
    .refine(
      (val) => !val || phoneRegex.test(val),
      'Phone must be +91 followed by 10 digits beginning 6-9 (e.g. +919876543210)'
    )
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .max(500, 'Website must not exceed 500 characters')
    .refine(
      (val) => !val || /^https?:\/\/.+/i.test(val),
      'Website must start with http:// or https://'
    )
    .optional()
    .or(z.literal('')),
});

type PatchFormData = z.infer<typeof patchSchema>;

interface ApprovedStorefrontProfileViewProps {
  application: SellerProfileResponseDTO;
  onPatchProfile: (data: PatchSellerProfileDTO) => Promise<void>;
  onUploadLogo: (file: File) => Promise<void>;
  onUploadBanner: (file: File) => Promise<void>;
  onDeleteLogo: () => Promise<void>;
  onDeleteBanner: () => Promise<void>;
}

export const ApprovedStorefrontProfileView: React.FC<ApprovedStorefrontProfileViewProps> = ({
  application,
  onPatchProfile,
  onUploadLogo,
  onUploadBanner,
  onDeleteLogo,
  onDeleteBanner,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmittingPatch, setIsSubmittingPatch] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<PatchFormData>({
    resolver: zodResolver(patchSchema),
    defaultValues: {
      description: application.description || '',
      supportEmail: application.supportEmail || '',
      supportPhone: application.supportPhone || '',
      website: application.website || '',
    },
  });

  const watchedDescription = watch('description');

  const handlePatchSubmit = handleSubmit(async (data) => {
    setApiError(null);
    setSuccessMessage(null);
    setIsSubmittingPatch(true);

    try {
      const payload: PatchSellerProfileDTO = {};
      if (data.description !== undefined) payload.description = data.description;
      if (data.supportEmail !== undefined && data.supportEmail !== '') payload.supportEmail = data.supportEmail;
      if (data.supportPhone !== undefined && data.supportPhone !== '') payload.supportPhone = data.supportPhone;
      if (data.website !== undefined) payload.website = data.website;

      await onPatchProfile(payload);
      setSuccessMessage('Storefront profile updated successfully.');
      setIsEditing(false);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.fieldErrors) {
          Object.entries(err.fieldErrors).forEach(([field, msg]) => {
            setError(field as keyof PatchFormData, { message: msg });
          });
        }
        setApiError(err.message);
      } else {
        setApiError('Failed to update storefront profile.');
      }
    } finally {
      setIsSubmittingPatch(false);
    }
  });

  return (
    <div className="space-y-8">
      {apiError && (
        <Alert variant="error" message={apiError} onClose={() => setApiError(null)} />
      )}
      {successMessage && (
        <Alert variant="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}

      {/* ── Public Storefront Live Preview Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-card">
        {/* Banner Area */}
        <div className="relative h-44 sm:h-56 w-full bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 overflow-hidden">
          {application.bannerUrl ? (
            <img
              src={application.bannerUrl}
              alt={`${application.storeName} banner`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/30 p-4">
              <Store className="h-10 w-10 stroke-[1.2] mb-1" />
              <span className="text-xs">No cover banner set</span>
            </div>
          )}

          {/* Status Badge in corner */}
          <div className="absolute top-4 right-4 z-10">
            <ApplicationStatusBadge status={application.status} size="sm" />
          </div>
        </div>

        {/* Store Profile Info Bar */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
            <div className="flex items-end gap-4">
              {/* Logo box */}
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-white border-2 border-white shadow-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                {application.logoUrl ? (
                  <img
                    src={application.logoUrl}
                    alt={`${application.storeName} logo`}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Store className="h-8 w-8 text-brand-600" />
                    <span className="text-[10px] mt-1 font-semibold uppercase text-gray-400">
                      Avenquo
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Slug */}
              <div className="pt-2 sm:pt-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                    {application.storeName}
                  </h2>
                  <span title="Verified Avenquo Merchant">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 font-mono">
                  <span>avenquo.com/store/{application.storeSlug}</span>
                  <a
                    href={`#storefront-preview`}
                    className="text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
                    onClick={(e) => e.preventDefault()}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick action button */}
            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <Button
                size="sm"
                variant={isEditing ? 'secondary' : 'primary'}
                onClick={() => {
                  setIsEditing(!isEditing);
                  setApiError(null);
                  setSuccessMessage(null);
                }}
              >
                <Edit3 className="h-3.5 w-3.5" />
                {isEditing ? 'Cancel Editing' : 'Edit Store Details'}
              </Button>
            </div>
          </div>

          {/* Description */}
          {application.description ? (
            <p className="text-sm text-gray-600 leading-relaxed max-w-3xl pt-2">
              {application.description}
            </p>
          ) : (
            <p className="text-xs text-gray-400 italic pt-2">
              No store description provided. Click "Edit Store Details" to add a bio.
            </p>
          )}

          {/* Metadata badges row */}
          <div className="flex flex-wrap items-center gap-4 pt-4 mt-4 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5 text-gray-400" />
              <span>{application.legalName} ({application.businessType})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-gray-400" />
              <span>{application.supportEmail}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-gray-400" />
              <span>{application.supportPhone}</span>
            </div>
            {application.website && (
              <a
                href={application.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-brand-600 hover:underline"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{application.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Brand Asset Management (Logo & Banner) ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-card space-y-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Brand Imagery</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload high-resolution merchant assets. These appear on your public store, category pages, and search cards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Dropzone */}
          <ImageUploadDropzone
            label="Storefront Logo"
            type="logo"
            currentUrl={application.logoUrl}
            onUpload={onUploadLogo}
            onDelete={onDeleteLogo}
            aspectRatioLabel="1:1 Square"
            recommendedSize="500 x 500 px"
          />

          {/* Banner Dropzone */}
          <ImageUploadDropzone
            label="Storefront Cover Banner"
            type="banner"
            currentUrl={application.bannerUrl}
            onUpload={onUploadBanner}
            onDelete={onDeleteBanner}
            aspectRatioLabel="3:1 Wide"
            recommendedSize="1200 x 400 px"
          />
        </div>
      </div>

      {/* ── Storefront Profile Patch Editor (Shown when Editing) ── */}
      {isEditing && (
        <form onSubmit={handlePatchSubmit} className="bg-white rounded-xl border border-brand-200 p-6 shadow-card space-y-6 ring-2 ring-brand-50" noValidate>
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Update Public Storefront Details</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Update customer support contacts, store summary, and official web link.
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
              PATCH /api/v1/sellers/profile
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Support Email Address"
              type="email"
              placeholder="help@yourbrand.com"
              error={errors.supportEmail?.message}
              hint="Public contact email for buyers"
              {...register('supportEmail')}
            />

            <Input
              label="Support Phone (+91)"
              placeholder="+919876543210"
              error={errors.supportPhone?.message}
              hint="Format: +91 followed by 10 digits beginning 6-9"
              {...register('supportPhone')}
            />
          </div>

          <Input
            label="Official Website URL"
            placeholder="https://yourbrand.com"
            error={errors.website?.message}
            hint="Optional link to your external website"
            {...register('website')}
          />

          <Textarea
            label="Storefront Description"
            rows={4}
            maxLength={2000}
            showCount
            value={watchedDescription}
            error={errors.description?.message}
            hint="Describe your brand and catalog (max 2000 chars)"
            {...register('description')}
            onChange={(e) => setValue('description', e.target.value, { shouldValidate: true })}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isSubmittingPatch}
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isSubmittingPatch}
            >
              <Check className="h-4 w-4" /> Save Changes
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
